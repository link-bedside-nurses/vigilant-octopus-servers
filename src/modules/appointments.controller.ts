import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { z } from 'zod';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../middlewares/authentication';
import { validateObjectID } from '../middlewares/validate-objectid';
import { handleAssignmentResponse, nurseAssignmentService } from '../services/nurse-assignment';
import { response } from '../utils/http-response';

const router = Router();
router.use(authenticate);

// Zod schema for appointment creation
const AppointmentCreateSchema = z.object({
	patient: z.string(),
	symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
	description: z.string().optional(),
	date: z.coerce.date().optional(),
	// add other fields as needed
});

// GET /appointments - get all appointments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const appointments = await db.appointments
			.find({})
			.sort({ createdAt: 'desc' })
			.populate('nurse')
			.populate('patient');
		return res.send(response(StatusCodes.OK, appointments, 'Appointments fetched successfully'));
	} catch (err) {
		return next(err);
	}
});

// POST /appointments - schedule appointment
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = AppointmentCreateSchema.safeParse(req.body);
		if (!result.success) {
			return res.send(response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message));
		}
		const { patient, symptoms, description, date } = result.data;
		const appointmentData: any = {
			patient,
			symptoms,
			description,
		};
		if (date) appointmentData.date = date;
		const resultDoc = await db.appointments.create(appointmentData);
		const populated = await (await resultDoc.populate('patient')).populate('nurse');
		return res.send(response(StatusCodes.OK, populated, 'Appointment scheduled successfully'));
	} catch (err) {
		return next(err);
	}
});

// GET /appointments/:id - get appointment by id
router.get('/:id', validateObjectID, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const appointment = await db.appointments
			.findById(req.params.id)
			.populate('nurse')
			.populate('patient');
		if (!appointment)
			return res.send(response(StatusCodes.NOT_FOUND, null, 'Appointment not found'));
		return res.send(response(StatusCodes.OK, appointment, 'Appointment fetched successfully'));
	} catch (err) {
		return next(err);
	}
});

// POST /appointments/history - get appointments history
router.post('/history', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const status = req.body.status;
		const query: mongoose.FilterQuery<any> = {};
		if (status) query.status = status;
		const pipeline: mongoose.PipelineStage[] = [
			{ $match: query },
			{
				$addFields: {
					order: {
						$switch: {
							branches: [
								{ case: { $eq: ['$status', 'ongoing'] }, then: 1 },
								{ case: { $eq: ['$status', 'pending'] }, then: 2 },
								{ case: { $eq: ['$status', 'cancelled'] }, then: 3 },
								{ case: { $eq: ['$status', 'completed'] }, then: 4 },
							],
							default: 5,
						},
					},
				},
			},
			{ $sort: { order: 1, createdAt: -1 } },
			{ $lookup: { from: 'patients', localField: 'patient', foreignField: '_id', as: 'patient' } },
			{ $lookup: { from: 'nurses', localField: 'nurse', foreignField: '_id', as: 'nurse' } },
			{ $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
			{ $unwind: { path: '$nurse', preserveNullAndEmptyArrays: true } },
		];
		const appointments = await db.appointments.aggregate(pipeline);
		return res.send(
			response(StatusCodes.OK, appointments, 'Appointments history fetched successfully')
		);
	} catch (err) {
		return next(err);
	}
});

// PATCH /appointments/:id/update - update appointment status
router.patch(
	'/:id/update',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { status } = req.body;
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ status },
				{ new: true }
			);
			return res.send(
				response(StatusCodes.OK, appointment, 'Appointment status updated successfully')
			);
		} catch (err) {
			return next(err);
		}
	}
);

// PATCH /appointments/:id/reschedule - reschedule appointment
router.patch(
	'/:id/reschedule',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { date } = req.body;
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ date },
				{ new: true }
			);
			return res.send(
				response(StatusCodes.OK, appointment, 'Appointment rescheduled successfully')
			);
		} catch (err) {
			return next(err);
		}
	}
);

// PATCH /appointments/:id/confirm - confirm appointment
router.patch(
	'/:id/confirm',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ status: APPOINTMENT_STATUSES.IN_PROGRESS },
				{ new: true }
			);
			return res.send(response(StatusCodes.OK, appointment, 'Appointment confirmed successfully'));
		} catch (err) {
			return next(err);
		}
	}
);

// PATCH /appointments/:id/cancel - cancel appointment
router.patch(
	'/:id/cancel',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { reason } = req.body;
			const adminId = req.account?.id;

			const updateData: any = {
				status: APPOINTMENT_STATUSES.CANCELLED,
				cancelledAt: new Date(),
			};

			if (reason) updateData.cancellationReason = reason;
			if (adminId) updateData.cancelledBy = adminId;

			const appointment = await db.appointments.findByIdAndUpdate(req.params.id, updateData, {
				new: true,
			});
			return res.send(response(StatusCodes.OK, appointment, 'Appointment cancelled successfully'));
		} catch (err) {
			return next(err);
		}
	}
);

// DELETE /appointments/:id - delete appointment
router.delete('/:id', validateObjectID, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const appointment = await db.appointments.findByIdAndDelete(req.params.id);
		return res.send(response(StatusCodes.OK, appointment, 'Appointment deleted successfully'));
	} catch (err) {
		return next(err);
	}
});

// Nurse Assignment Endpoints (Admin Only)

/**
 * GET /appointments/pending - Get pending appointments without assigned nurses
 */
router.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accountType = req.account?.type;

		if (accountType !== 'admin') {
			return res.send(response(StatusCodes.FORBIDDEN, null, 'Admin access required'));
		}

		const assignmentResponse = await nurseAssignmentService.getPendingAppointments();
		handleAssignmentResponse(res, assignmentResponse);
	} catch (err) {
		return next(err);
	}
});

/**
 * GET /appointments/available-nurses - Get available nurses for assignment
 */
router.get('/available-nurses', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accountType = req.account?.type;

		if (accountType !== 'admin') {
			return res.send(response(StatusCodes.FORBIDDEN, null, 'Admin access required'));
		}

		const assignmentResponse = await nurseAssignmentService.getAvailableNurses();
		handleAssignmentResponse(res, assignmentResponse);
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /appointments/:id/assign-nurse - Assign nurse to appointment
 */
router.post(
	'/:id/assign-nurse',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountType = req.account?.type;
			const adminId = req.account?.id;

			if (accountType !== 'admin') {
				return res.send(response(StatusCodes.FORBIDDEN, null, 'Admin access required'));
			}

			const { nurseId, notes } = req.body;

			if (!nurseId) {
				return res.send(response(StatusCodes.BAD_REQUEST, null, 'Nurse ID is required'));
			}

			const assignmentRequest = {
				appointmentId: req.params.id,
				nurseId,
				notes,
			};

			const assignmentResponse = await nurseAssignmentService.assignNurseToAppointment(
				assignmentRequest,
				adminId!
			);
			handleAssignmentResponse(res, assignmentResponse);
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * POST /appointments/:id/reassign-nurse - Reassign nurse to appointment
 */
router.post(
	'/:id/reassign-nurse',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountType = req.account?.type;
			const adminId = req.account?.id;

			if (accountType !== 'admin') {
				return res.send(response(StatusCodes.FORBIDDEN, null, 'Admin access required'));
			}

			const { nurseId, reason } = req.body;

			if (!nurseId) {
				return res.send(response(StatusCodes.BAD_REQUEST, null, 'Nurse ID is required'));
			}

			const assignmentResponse = await nurseAssignmentService.reassignNurse(
				req.params.id,
				nurseId,
				adminId!,
				reason
			);
			handleAssignmentResponse(res, assignmentResponse);
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * GET /appointments/nurse/:nurseId - Get appointments assigned to a specific nurse
 */
router.get(
	'/nurse/:nurseId',
	validateObjectID,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountType = req.account?.type;
			const nurseId = req.account?.id;

			// Allow admin to view any nurse's appointments, or nurse to view their own
			if (accountType !== 'admin' && accountType !== 'nurse') {
				return res.send(response(StatusCodes.FORBIDDEN, null, 'Admin or nurse access required'));
			}

			if (accountType === 'nurse' && nurseId !== req.params.nurseId) {
				return res.send(
					response(StatusCodes.FORBIDDEN, null, 'You can only view your own appointments')
				);
			}

			const assignmentResponse = await nurseAssignmentService.getNurseAppointments(
				req.params.nurseId
			);
			handleAssignmentResponse(res, assignmentResponse);
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
