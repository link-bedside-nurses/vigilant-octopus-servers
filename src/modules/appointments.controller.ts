import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { z } from 'zod';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../middlewares/authentication';
import { validateObjectID } from '../middlewares/validate-objectid';
import { handleAssignmentResponse, nurseAssignmentService } from '../services/nurse-assignment';
import { sendNormalized } from '../utils/http-response';

const router = Router();
router.use( authenticate );

// Zod schema for appointment creation
const GeoJSONLocationSchema = z.object( {
    type: z.literal( 'Point' ),
    coordinates: z.tuple( [z.number().min( -180 ).max( 180 ), z.number().min( -90 ).max( 90 )] ),
} );

const AppointmentCreateSchema = z.object( {
    patient: z.string(),
    symptoms: z.array( z.string() ).min( 1, 'At least one symptom is required' ),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    location: GeoJSONLocationSchema.optional(),
    coordinates: z
        .tuple( [z.number().min( -180 ).max( 180 ), z.number().min( -90 ).max( 90 )] )
        .optional(),
} );

// GET /appointments - get all appointments
router.get( '/', async ( _req: Request, res: Response, next: NextFunction ) => {
	try {
		const appointments = await db.appointments
			.find( {} )
			.sort( { createdAt: 'desc' } )
			.populate( 'nurse' )
			.populate( 'patient' )
			.populate( 'payments' );
		return sendNormalized( res, StatusCodes.OK, appointments, 'Appointments fetched successfully' );
	} catch ( err ) {
		return next( err );
	}
} );

router.get('/current-appointment', async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Verify authentication
		const patientId = req.account?.id;
		const accountType = req.account?.type;

		if (!patientId || accountType !== 'patient') {
			return sendNormalized(
				res,
				StatusCodes.UNAUTHORIZED,
				null,
				'Patient authentication required'
			);
		}

		// Verify patient exists
		const patient = await db.patients.findById(patientId);
		if (!patient) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Patient not found');
		}


		// Get most recent appointment for the patient
		const mostRecentAppointment = await db.appointments
			.findOne({ patient: patientId })
			.sort({ createdAt: -1 })
			.populate('nurse')
			.populate('payments').populate('patient');

		console.log(mostRecentAppointment);

		return sendNormalized(
			res,
			StatusCodes.OK,
			mostRecentAppointment,
			'Fetched most recent appointment successfully'
		);
	} catch (err) {
		return next(err);
	}
});

// POST /appointments - schedule appointment
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
	// Start a MongoDB session for transaction
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Validate request body
		const result = AppointmentCreateSchema.safeParse(req.body);

		if (!result.success) {
			await session.abortTransaction();
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				result.error.issues[0].message
			);
		}

		const { patient, symptoms, description, date, location, coordinates } = result.data;

		// Verify patient exists
		const patientDoc = await db.patients.findById(patient).session(session);
		if (!patientDoc) {
			await session.abortTransaction();
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Patient not found');
		}

		// Check if patient is banned
		if (patientDoc.isBanned === true) {
			await session.abortTransaction();
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Patient account is banned and cannot schedule appointments'
			);
		}

		// SECURITY CHECK: Verify the requesting user is the patient or an admin
		const requesterId = req.account?.id;
		const requesterType = req.account?.type;

		if (requesterType !== 'admin' && requesterId !== patient) {
			await session.abortTransaction();
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'You can only schedule appointments for yourself'
			);
		}

		// Check for existing active appointments (PENDING or IN_PROGRESS)
		const existingActiveAppointments = await db.appointments
			.find({
				patient,
				status: { $in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS] },
			})
			.session(session);

		if (existingActiveAppointments.length > 0) {
			// Cancel all existing pending appointments
			const cancelledCount = await db.appointments.updateMany(
				{
					patient,
					status: APPOINTMENT_STATUSES.PENDING,
				},
				{
					$set: {
						status: APPOINTMENT_STATUSES.CANCELLED,
						cancelledAt: new Date(),
						cancellationReason:
							'Automatically cancelled due to new appointment scheduling',
						cancelledBy: requesterId,
					},
				},
				{ session }
			);

			console.log(`Cancelled ${cancelledCount.modifiedCount} pending appointments for patient ${patient}`);

			// Check if there are any IN_PROGRESS appointments
			const inProgressAppointment = existingActiveAppointments.find(
				(apt) => apt.status === APPOINTMENT_STATUSES.IN_PROGRESS
			);

			if (inProgressAppointment) {
				await session.abortTransaction();
				return sendNormalized(
					res,
					StatusCodes.CONFLICT,
					{
						existingAppointment: inProgressAppointment,
						message: 'You have an appointment currently in progress',
					},
					'Cannot schedule a new appointment while one is in progress. Please wait for the current appointment to complete.'
				);
			}
		}

		// Prepare appointment data
		const appointmentData: any = {
			patient,
			symptoms,
			description,
			status: APPOINTMENT_STATUSES.PENDING,
		};

		if (date) appointmentData.date = date;

		// Backward compatibility: accept either `location` or raw `coordinates`
		if (location) {
			appointmentData.location = location;
		} else if (coordinates) {
			appointmentData.location = { type: 'Point', coordinates };
		}

		// Validate location data exists
		if (!appointmentData.location) {
			await session.abortTransaction();
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Location is required for appointment scheduling'
			);
		}

		// Create the new appointment
		const [resultDoc] = await db.appointments.create([appointmentData], { session });

		// Commit the transaction
		await session.commitTransaction();

		// Populate the created appointment
		const populated = await db.appointments
			.findById(resultDoc._id)
			.populate('patient')
			.populate('nurse')
			.populate('payments');

		return sendNormalized(
			res,
			StatusCodes.CREATED,
			populated,
			'Appointment scheduled successfully. Any previous pending appointments have been cancelled.'
		);
	} catch (err) {
		// Rollback transaction on error
		await session.abortTransaction();
		console.error('Error scheduling appointment:', err);
		return next(err);
	} finally {
		// End the session
		session.endSession();
	}
});

// POST /appointments/history - get appointments history
router.post( '/history', async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		const status = req.body.status;
		const query: mongoose.FilterQuery<any> = {};
		if ( status ) query.status = status;
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
		const appointments = await db.appointments.aggregate( pipeline );
		return sendNormalized(
			res,
			StatusCodes.OK,
			appointments,
			'Appointments history fetched successfully'
		);
	} catch ( err ) {
		return next( err );
	}
} );

// Nurse Assignment Endpoints (Admin Only) - These must come before /:id routes

/**
 * GET /appointments/pending - Get pending appointments without assigned nurses
 */
router.get( '/pending', async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		const accountType = req.account?.type;

		if ( accountType !== 'admin' ) {
			return sendNormalized( res, StatusCodes.FORBIDDEN, null, 'Admin access required' );
		}

		const assignmentResponse = await nurseAssignmentService.getPendingAppointments();
		handleAssignmentResponse( res, assignmentResponse );
	} catch ( err ) {
		return next( err );
	}
} );

/**
 * GET /appointments/available-nurses - Get available nurses for assignment
 */
router.get( '/available-nurses', async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		const accountType = req.account?.type;

		if ( accountType !== 'admin' ) {
			return sendNormalized( res, StatusCodes.FORBIDDEN, null, 'Admin access required' );
		}

		const assignmentResponse = await nurseAssignmentService.getAvailableNurses();
		handleAssignmentResponse( res, assignmentResponse );
	} catch ( err ) {
		return next( err );
	}
} );

/**
 * GET /appointments/nurse/:nurseId - Get appointments assigned to a specific nurse
 */
router.get(
	'/nurse/:nurseId',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const accountType = req.account?.type;
			const nurseId = req.account?.id;

			// Allow admin to view any nurse's appointments, or nurse to view their own
			if ( accountType !== 'admin' && accountType !== 'nurse' ) {
				return sendNormalized( res, StatusCodes.FORBIDDEN, null, 'Admin or nurse access required' );
			}

			if ( accountType === 'nurse' && nurseId !== req.params.nurseId ) {
				return sendNormalized(
					res,
					StatusCodes.FORBIDDEN,
					null,
					'You can only view your own appointments'
				);
			}

			const assignmentResponse = await nurseAssignmentService.getNurseAppointments(
				req.params.nurseId
			);
			handleAssignmentResponse( res, assignmentResponse );
		} catch ( err ) {
			return next( err );
		}
	}
);

// GET /appointments/:id - get appointment by id (must come after specific routes)
router.get( '/:id', validateObjectID, async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		const appointment = await db.appointments
			.findById( req.params.id )
			.populate( 'nurse' )
			.populate( 'patient' )
			.populate( 'payments' );
		if ( !appointment )
			return sendNormalized( res, StatusCodes.NOT_FOUND, null, 'Appointment not found' );
		return sendNormalized( res, StatusCodes.OK, appointment, 'Appointment fetched successfully' );
	} catch ( err ) {
		return next( err );
	}
} );

// PATCH /appointments/:id/update - update appointment status
router.patch(
	'/:id/update',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { status } = req.body;
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ status },
				{ new: true }
			);
			return sendNormalized(
				res,
				StatusCodes.OK,
				appointment,
				'Appointment status updated successfully'
			);
		} catch ( err ) {
			return next( err );
		}
	}
);

// PATCH /appointments/:id/reschedule - reschedule appointment
router.patch(
	'/:id/reschedule',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { date } = req.body;
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ date },
				{ new: true }
			);
			return sendNormalized(
				res,
				StatusCodes.OK,
				appointment,
				'Appointment rescheduled successfully'
			);
		} catch ( err ) {
			return next( err );
		}
	}
);

// PATCH /appointments/:id/confirm - confirm appointment
router.patch(
	'/:id/confirm',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const appointment = await db.appointments.findByIdAndUpdate(
				req.params.id,
				{ status: APPOINTMENT_STATUSES.IN_PROGRESS },
				{ new: true }
			);
			return sendNormalized( res, StatusCodes.OK, appointment, 'Appointment confirmed successfully' );
		} catch ( err ) {
			return next( err );
		}
	}
);

// PATCH /appointments/:id/cancel - cancel appointment
router.patch(
	'/:id/cancel',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { reason } = req.body;
			const adminId = req.account?.id;

			const updateData: any = {
				status: APPOINTMENT_STATUSES.CANCELLED,
				cancelledAt: new Date(),
			};

			if ( reason ) updateData.cancellationReason = reason;
			if ( adminId ) updateData.cancelledBy = adminId;

			const appointment = await db.appointments.findByIdAndUpdate( req.params.id, updateData, {
				new: true,
			} );
			return sendNormalized( res, StatusCodes.OK, appointment, 'Appointment cancelled successfully' );
		} catch ( err ) {
			return next( err );
		}
	}
);

/**
 * POST /appointments/:id/assign-nurse - Assign nurse to appointment
 */
router.post(
	'/:id/assign-nurse',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const accountType = req.account?.type;
			const adminId = req.account?.id;

			if ( accountType !== 'admin' ) {
				return sendNormalized( res, StatusCodes.FORBIDDEN, null, 'Admin access required' );
			}

			const { nurseId, notes } = req.body;

			if ( !nurseId ) {
				return sendNormalized( res, StatusCodes.BAD_REQUEST, null, 'Nurse ID is required' );
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
			handleAssignmentResponse( res, assignmentResponse );
		} catch ( err ) {
			return next( err );
		}
	}
);

/**
 * POST /appointments/:id/reassign-nurse - Reassign nurse to appointment
 */
router.post(
	'/:id/reassign-nurse',
	validateObjectID,
	async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const accountType = req.account?.type;
			const adminId = req.account?.id;

			if ( accountType !== 'admin' ) {
				return sendNormalized( res, StatusCodes.FORBIDDEN, null, 'Admin access required' );
			}

			const { nurseId, reason } = req.body;

			if ( !nurseId ) {
				return sendNormalized( res, StatusCodes.BAD_REQUEST, null, 'Nurse ID is required' );
			}

			const assignmentResponse = await nurseAssignmentService.reassignNurse(
				req.params.id,
				nurseId,
				adminId!,
				reason
			);
			handleAssignmentResponse( res, assignmentResponse );
		} catch ( err ) {
			return next( err );
		}
	}
);

// DELETE /appointments/:id - delete appointment
router.delete( '/:id', validateObjectID, async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		const appointment = await db.appointments.findByIdAndDelete( req.params.id );
		return sendNormalized( res, StatusCodes.OK, appointment, 'Appointment deleted successfully' );
	} catch ( err ) {
		return next( err );
	}
} );

export default router;
