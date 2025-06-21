import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { z } from 'zod';
import { db } from '../database';
import authenticate from '../middlewares/authentication';
import { AirtelCollectionsService } from '../payments/airtel/collections/collections-service';
import { MomoCollectionsService } from '../payments/momo/collections/collections-service';
import detectProvider from '../utils/detect-provider';
import { sendNormalized } from '../utils/http-response';

const router = Router();
router.use(authenticate);

const PaymentSchema = z.object({
	amount: z.number(),
	appointment: z.string(),
	message: z.string().optional(),
	provider: z.enum(['MTN', 'AIRTEL']).optional(),
});

// GET /payments - get all payments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const payments = await db.payments.find({}).sort({ createdAt: 'desc' });
		return sendNormalized(res, StatusCodes.OK, payments, 'Payments Retrieved');
	} catch (err) {
		return next(err);
	}
});

// POST /payments/patient/:id/initiate - initiate payment from patient (must come before /:id routes)
router.post('/patient/:id/initiate', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = PaymentSchema.safeParse(req.body);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		const patient = await db.patients.findById(req.params.id);
		if (!patient) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Patient not found');
		}
		const appointment = await db.appointments.findById(result.data.appointment);
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
		// Prevent duplicate successful payments
		const existingPaid = await db.payments.findOne({
			appointment: appointment._id,
			status: 'SUCCESSFUL',
		});
		if (existingPaid) {
			return sendNormalized(
				res,
				StatusCodes.CONFLICT,
				null,
				'Payment already completed for this appointment'
			);
		}
		const paymentPhone = patient.phone;
		const provider = result.data.provider || detectProvider(paymentPhone);
		let referenceId: string;
		if (provider === 'MTN') {
			const collectionsService = MomoCollectionsService.getInstance();
			referenceId = await collectionsService.requestToPay(
				result.data.amount.toString(),
				paymentPhone,
				result.data.message || `Payment request for ${result.data.amount} UGX`
			);
		} else {
			const airtelService = AirtelCollectionsService.getInstance();
			referenceId = await airtelService.requestToPay(result.data.amount, paymentPhone);
		}
		const payment = await db.payments.create({
			patient: patient.id,
			amount: result.data.amount,
			appointment: appointment._id,
			comment: result.data.message || `Payment request for ${result.data.amount} UGX`,
			referenceId,
			status: 'PENDING',
			paymentMethod: provider,
			createdAt: new Date(),
		});
		// Add payment to appointment.payments array
		await db.appointments.findByIdAndUpdate(appointment._id, {
			$push: { payments: payment._id },
			paymentStatus: 'PENDING',
		});
		return sendNormalized(
			res,
			StatusCodes.OK,
			{ payment, referenceId },
			'Payment initiated successfully'
		);
	} catch (err) {
		return next(err);
	}
});

// GET /payments/nurses/:id/earnings - get nurse earnings (must come before /:id routes)
router.get('/nurses/:id/earnings', async (req: Request, res: Response, next: NextFunction) => {
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
					'appointmentDetails.nurse': new mongoose.Types.ObjectId(req.params.id),
					status: 'SUCCESSFUL',
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
});

// GET /payments/patients/:id/payments - get payments by patient (must come before /:id routes)
router.get('/patients/:id/payments', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payments = await db.payments.find({ patient: req.params.id }).sort({ createdAt: 'desc' });
		return sendNormalized(res, StatusCodes.OK, payments, 'Payments Retrieved');
	} catch (err) {
		return next(err);
	}
});

// GET /payments/:id - get payment by id (must come after specific routes)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payment = await db.payments
			.findById(req.params.id)
			.populate('appointment')
			.populate('nurse')
			.populate('patient');
		if (!payment) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No Payment Found');
		return sendNormalized(res, StatusCodes.OK, payment, 'Payment Retrieved');
	} catch (err) {
		return next(err);
	}
});

// GET /payments/:id/status - check payment status
router.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payment = await db.payments.findById(req.params.id);
		if (!payment) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Payment not found');
		}
		let statusResult;
		if (payment.paymentMethod === 'MTN') {
			const collectionsService = MomoCollectionsService.getInstance();
			statusResult = await collectionsService.getTransactionStatus(payment.referenceId);
			if (statusResult.status) payment.status = statusResult.status;
			if (statusResult.financialTransactionId)
				payment.transactionId = statusResult.financialTransactionId;
		} else if (payment.paymentMethod === 'AIRTEL') {
			const airtelService = AirtelCollectionsService.getInstance();
			statusResult = await airtelService.getTransactionStatus(payment.referenceId);
			if (statusResult.status) payment.status = statusResult.status;
			if (statusResult.transactionId) payment.transactionId = statusResult.transactionId;
		}
		await payment.save();
		// Update appointment paymentStatus accordingly
		if (payment.status === 'SUCCESSFUL') {
			await db.appointments.findByIdAndUpdate(payment.appointment, { paymentStatus: 'PAID' });
		} else if (payment.status === 'FAILED') {
			await db.appointments.findByIdAndUpdate(payment.appointment, { paymentStatus: 'FAILED' });
		}
		return sendNormalized(
			res,
			StatusCodes.OK,
			{ payment, status: statusResult },
			'Payment status retrieved'
		);
	} catch (err) {
		return next(err);
	}
});

export default router;
