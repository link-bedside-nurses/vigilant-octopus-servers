import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { z } from 'zod';
import { db } from '../database';
import authenticate from '../middlewares/authentication';
import { AirtelCollectionsService } from '../payments/airtel/collections/collections-service';
import { MomoCollectionsService } from '../payments/momo/collections/collections-service';
import detectProvider from '../utils/detect-provider';
import { response } from '../utils/http-response';

const router = Router();

const PaymentSchema = z.object({
	amount: z.number(),
	appointment: z.string(),
	message: z.string().optional(),
	provider: z.enum(['MTN', 'AIRTEL']).optional(),
});

// GET /payments - get all payments
router.get('/', authenticate, async (_req: Request, _res: Response, next: NextFunction) => {
	try {
		const payments = await db.payments.find({}).sort({ createdAt: 'desc' });
		return response(StatusCodes.OK, payments, 'Payments Retrieved');
	} catch (err) {
		return next(err);
	}
});

// GET /payments/:id - get payment by id
router.get('/:id', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const payment = await db.payments.findById(req.params.id);
		if (!payment) return response(StatusCodes.NOT_FOUND, null, 'No Payment Found');
		return response(StatusCodes.OK, payment, 'Payment Retrieved');
	} catch (err) {
		return next(err);
	}
});

// POST /payments/patient/:id/initiate - initiate payment from patient
router.post(
	'/patient/:id/initiate',
	authenticate,
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const result = PaymentSchema.safeParse(req.body);
			if (!result.success) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				);
			}
			const patient = await db.patients.findById(req.params.id);
			if (!patient) {
				return response(StatusCodes.NOT_FOUND, null, 'Patient not found');
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
				appointment: result.data.appointment,
				comment: result.data.message || `Payment request for ${result.data.amount} UGX`,
				referenceId,
				status: 'PENDING',
				paymentMethod: provider,
				createdAt: new Date(),
			});
			return response(StatusCodes.OK, { payment, referenceId }, 'Payment initiated successfully');
		} catch (err) {
			return next(err);
		}
	}
);

// GET /payments/:id/status - check payment status
router.get(
	'/:id/status',
	authenticate,
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const payment = await db.payments.findById(req.params.id);
			if (!payment) {
				return response(StatusCodes.NOT_FOUND, null, 'Payment not found');
			}
			const collectionsService = MomoCollectionsService.getInstance();
			const status = await collectionsService.getTransactionStatus(payment.referenceId);
			payment.status = status.status;
			if (status.financialTransactionId) {
				payment.transactionId = status.financialTransactionId;
			}
			await payment.save();
			return response(StatusCodes.OK, { payment, status }, 'Payment status retrieved');
		} catch (err) {
			return next(err);
		}
	}
);

// GET /payments/nurses/:id/earnings - get nurse earnings
router.get(
	'/nurses/:id/earnings',
	authenticate,
	async (req: Request, _res: Response, next: NextFunction) => {
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
			return response(
				StatusCodes.OK,
				{
					totalEarnings: result.totalEarnings,
					payments: result.payments,
				},
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
	authenticate,
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const payments = await db.payments
				.find({ patient: req.params.id })
				.sort({ createdAt: 'desc' });
			return response(StatusCodes.OK, payments, 'Payments Retrieved');
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
