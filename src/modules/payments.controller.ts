import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { db } from '../database';
import { PaymentStatus } from '../database/models/Payment';
import authenticate from '../middlewares/authentication';
import { validateObjectID } from '../middlewares/validate-objectid';
import { CollectionService } from '../payments/collection.service';
import { MarzPayService } from '../payments/marzpay.service';
import { IWebhookPayload, WebhookService } from '../payments/webhook.service';
import { sendNormalized } from '../utils/http-response';

const router = Router();

// Webhook endpoint (no authentication required)
router.post('/webhooks/collection', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload: IWebhookPayload = req.body;
		const headers = req.headers as Record<string, string>;
		const senderIp = req.ip;

		const webhookService = new WebhookService();
		const result = await webhookService.processWebhook(payload, headers, senderIp);

		return sendNormalized(res, StatusCodes.OK, result, 'Webhook processed successfully');
	} catch (err) {
		return next(err);
	}
});

// All other routes require authentication
router.use(authenticate);

// Zod schema for payment initiation
const InitiatePaymentSchema = z.object({
	amount: z
		.number()
		.min(500, 'Amount must be at least 500 UGX')
		.max(10000000, 'Amount must not exceed 10,000,000 UGX'),
	appointmentId: z.string(),
	description: z.string().optional(),
	phoneNumber: z.string().optional(),
});

// GET /payments - get all payments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const collectionService = new CollectionService();
		const result = await collectionService.findAll();
		return sendNormalized(res, StatusCodes.OK, result.data, 'Payments retrieved successfully');
	} catch (err) {
		return next(err);
	}
});

// POST /payments/patient/:id/initiate - initiate payment from patient
router.post(
	'/patient/:id/initiate',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = InitiatePaymentSchema.safeParse(req.body);
			if (!result.success) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
			}

			const patient = await db.patients.findById(req.params.id);
			if (!patient) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Patient not found');
			}

			const appointment = await db.appointments.findById(result.data.appointmentId);
			if (!appointment) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Appointment not found');
			}

			if (String(appointment.patient) !== String(patient._id)) {
				return sendNormalized(
					res,
					StatusCodes.FORBIDDEN,
					null,
					'Appointment does not belong to patient'
				);
			}

			// Check if payment already exists and is successful
			const existingPaid = await db.payments.findOne({
				appointment: appointment._id,
				status: PaymentStatus.SUCCESSFUL,
			});
			if (existingPaid) {
				return sendNormalized(
					res,
					StatusCodes.CONFLICT,
					null,
					'Payment already completed for this appointment'
				);
			}

			// Use phone number from request or patient's phone
			const phoneNumber = result.data.phoneNumber || patient.phone;

			const collectionService = new CollectionService();
			const payment = await collectionService.createCollection({
				amount: result.data.amount,
				phoneNumber,
				appointmentId: result.data.appointmentId,
				patientId: patient.id,
				description:
					result.data.description || `Payment for appointment ${result.data.appointmentId}`,
			});

			return sendNormalized(
				res,
				StatusCodes.OK,
				payment,
				'Payment initiated successfully. Please check your phone to complete the payment.'
			);
		} catch (err: any) {
			// Handle specific error cases
			if (err.message) {
				return sendNormalized(res, err.statusCode || StatusCodes.BAD_REQUEST, null, err.message);
			}
			return next(err);
		}
	}
);

// GET /payments/nurses/:id/earnings - get nurse earnings
router.get(
	'/nurses/:id/earnings',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const payments = await db.payments.aggregate([
				{
					$lookup: {
						from: 'appointments',
						localField: 'appointment',
						foreignField: '_id',
						as: 'appointmentDetails',
					},
				},
				{ $unwind: '$appointmentDetails' },
				{
					$match: {
						'appointmentDetails.nurse': req.params.id,
						status: PaymentStatus.SUCCESSFUL,
					},
				},
				{
					$group: {
						_id: null,
						totalEarnings: { $sum: '$amount' },
						payments: { $push: '$$ROOT' },
					},
				},
			]);

			const result = payments[0] || { totalEarnings: 0, payments: [] };
			return sendNormalized(
				res,
				StatusCodes.OK,
				{ totalEarnings: result.totalEarnings, payments: result.payments },
				'Nurse earnings retrieved successfully'
			);
		} catch (err) {
			return next(err);
		}
	}
);

// GET /payments/patients/:id/payments - get payments by patient
router.get(
	'/patients/:id/payments',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const collectionService = new CollectionService();
			const result = await collectionService.findAll({ patient: req.params.id });
			return sendNormalized(res, StatusCodes.OK, result.data, 'Payments retrieved successfully');
		} catch (err) {
			return next(err);
		}
	}
);

// GET /payments/appointments/:id/payments - get payments by appointment
router.get(
	'/appointments/:id/payments',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const collectionService = new CollectionService();
			const result = await collectionService.findAll({ appointmentId: req.params.id });
			return sendNormalized(res, StatusCodes.OK, result.data, 'Payments retrieved successfully');
		} catch (err) {
			return next(err);
		}
	}
);

// GET /payments/statistics - get payment statistics
router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { patientId, appointmentId } = req.query;
		const collectionService = new CollectionService();
		const stats = await collectionService.getStatistics({
			patient: patientId as string,
			appointmentId: appointmentId as string,
		});
		return sendNormalized(res, StatusCodes.OK, stats, 'Payment statistics retrieved successfully');
	} catch (err) {
		return next(err);
	}
});

// GET /payments/generate-reference - generate a unique payment reference
router.get('/generate-reference', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const collectionService = new CollectionService();
		const reference = collectionService.generateReference();
		return sendNormalized(res, StatusCodes.OK, { reference }, 'Reference generated successfully');
	} catch (err) {
		return next(err);
	}
});

// GET /payments/:id - get payment by id
router.get('/:id', validateObjectID, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const collectionService = new CollectionService();
		const payment = await collectionService.findById(req.params.id);
		return sendNormalized(res, StatusCodes.OK, payment, 'Payment retrieved successfully');
	} catch (err: any) {
		if (err.message === 'Payment not found') {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Payment not found');
		}
		return next(err);
	}
});

// GET /payments/:id/status - check payment status and refresh from API
router.get(
	'/:id/status',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const collectionService = new CollectionService();
			const payment = await collectionService.refreshStatus(req.params.id);
			return sendNormalized(res, StatusCodes.OK, payment, 'Payment status refreshed successfully');
		} catch (err: any) {
			if (err.message === 'Payment not found') {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Payment not found');
			}
			return next(err);
		}
	}
);

// POST /payments/:id/cancel - cancel a pending payment
router.post(
	'/:id/cancel',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const collectionService = new CollectionService();
			const payment = await collectionService.cancelPayment(req.params.id);
			return sendNormalized(res, StatusCodes.OK, payment, 'Payment cancelled successfully');
		} catch (err: any) {
			if (err.message === 'Payment not found') {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Payment not found');
			}
			if (err.message.includes('Can only cancel')) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, err.message);
			}
			return next(err);
		}
	}
);

// GET /payments/reference/:reference - get payment by reference
router.get('/reference/:reference', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const collectionService = new CollectionService();
		const payment = await collectionService.findByReference(req.params.reference);
		return sendNormalized(res, StatusCodes.OK, payment, 'Payment retrieved successfully');
	} catch (err: any) {
		if (err.message === 'Payment not found') {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Payment not found');
		}
		return next(err);
	}
});

// GET /payments/detect-provider/:phoneNumber - detect mobile money provider
router.get(
	'/detect-provider/:phoneNumber',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const marzPayService = MarzPayService.getInstance();
			const provider = marzPayService.detectProvider(req.params.phoneNumber);
			return sendNormalized(
				res,
				StatusCodes.OK,
				{ phoneNumber: req.params.phoneNumber, provider },
				'Provider detected successfully'
			);
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
