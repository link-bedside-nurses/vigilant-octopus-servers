import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { QualificationDocument } from '../database/models/Nurse';
import { NurseProfileUpdateSchema, QualificationSchema } from '../interfaces/dtos';
import authenticate from '../middlewares/authentication';
import {
	handleNurseUploadError,
	uploadProfilePictureOnly,
	uploadQualificationsOnly,
} from '../middlewares/nurse-upload.middleware';
import { CollectionService } from '../payments/collection.service';
import { diskStorageService } from '../services/disk-storage';
import { sendNormalized } from '../utils/http-response';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Middleware to verify nurse access
const verifyNurseAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const account = req.account;

		if (account?.type !== 'nurse') {
			return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Nurse access required');
		}

		const nurse = await db.nurses.findById(account.id);

		if (!nurse) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse account not found');
		}

		if (!nurse.isActive) {
			return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Your account is deactivated');
		}

		if (!nurse.isVerified) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Your account is pending verification'
			);
		}

		// Attach nurse to request for use in handlers
		(req as any).nurse = nurse;
		return next();
	} catch (error) {
		return next(error);
	}
};

router.use(verifyNurseAccess);

// ============================================================================
// NURSE PROFILE ROUTES
// ============================================================================

/**
 * GET /nurse-portal/profile
 * Get nurse profile with all details
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = (req as any).nurse;

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				nurse: {
					id: nurse.id,
					firstName: nurse.firstName,
					lastName: nurse.lastName,
					phone: nurse.phone,
					email: nurse.email,
					profilePicture: nurse.profilePicture,
					nationalId: nurse.nationalId,
					qualifications: nurse.qualifications,
					isActive: nurse.isActive,
					isVerified: nurse.isVerified,
					documentVerificationStatus: nurse.documentVerificationStatus,
					createdAt: nurse.createdAt,
					updatedAt: nurse.updatedAt,
				},
			},
			'Profile retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching nurse profile:', error);
		return next(error);
	}
});

/**
 * PATCH /nurse-portal/profile
 * Update nurse profile (name, email)
 */
router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = (req as any).nurse;
		const result = NurseProfileUpdateSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { firstName, lastName, email } = result.data;

		// Check email uniqueness if updating
		if (email && email !== nurse.email) {
			const existingEmail = await db.nurses.findOne({ email, _id: { $ne: nurse._id } });
			if (existingEmail) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Email already in use');
			}
		}

		// Update nurse
		if (firstName) nurse.firstName = firstName;
		if (lastName) nurse.lastName = lastName;
		if (email) nurse.email = email;

		await nurse.save();

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				nurse: {
					id: nurse.id,
					firstName: nurse.firstName,
					lastName: nurse.lastName,
					phone: nurse.phone,
					email: nurse.email,
				},
			},
			'Profile updated successfully'
		);
	} catch (error) {
		console.error('Error updating nurse profile:', error);
		return next(error);
	}
});

/**
 * POST /nurse-portal/profile-picture
 * Update profile picture
 */
router.post(
	'/profile-picture',
	uploadProfilePictureOnly,
	handleNurseUploadError,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const file = req.file;

			if (!file) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'No profile picture uploaded');
			}

			// Validate it's an image
			if (!file.mimetype.startsWith('image/')) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Profile picture must be an image'
				);
			}

			// Delete old profile picture if exists
			if (nurse.profilePicture?.publicId) {
				await diskStorageService.deleteFile(nurse.profilePicture.publicId);
			}

			// Upload new profile picture
			const uploadResult = await diskStorageService.uploadFile(file);

			nurse.profilePicture = {
				publicId: uploadResult.publicId,
				url: uploadResult.url,
				filename: uploadResult.filename,
				mimeType: uploadResult.mimeType,
				size: uploadResult.size,
				uploadedAt: new Date(),
				originalName: uploadResult.filename,
				hash: uploadResult.hash,
			};

			await nurse.save();

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					profilePicture: nurse.profilePicture,
				},
				'Profile picture updated successfully'
			);
		} catch (error) {
			console.error('Error updating profile picture:', error);
			return next(error);
		}
	}
);

/**
 * POST /nurse-portal/qualifications
 * Add new qualification documents
 */
router.post(
	'/qualifications',
	uploadQualificationsOnly,
	handleNurseUploadError,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const files = req.files as Express.Multer.File[];

			if (!files || files.length === 0) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'No qualification documents uploaded'
				);
			}

			// Parse qualification metadata
			let qualificationsMeta: any[] = [];
			try {
				if (req.body.qualificationsMeta) {
					qualificationsMeta =
						typeof req.body.qualificationsMeta === 'string'
							? JSON.parse(req.body.qualificationsMeta)
							: req.body.qualificationsMeta;
				}
			} catch (error) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid qualificationsMeta format'
				);
			}

			if (qualificationsMeta.length !== files.length) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Qualifications metadata count must match files count'
				);
			}

			const newQualifications: QualificationDocument[] = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const meta = qualificationsMeta[i];

				// Validate metadata
				const metaValidation = QualificationSchema.safeParse(meta);
				if (!metaValidation.success) {
					return sendNormalized(
						res,
						StatusCodes.BAD_REQUEST,
						null,
						`Qualification ${i + 1}: ${metaValidation.error.issues[0].message}`
					);
				}

				// Upload file
				const uploadResult = await diskStorageService.uploadFile(file);

				const qualification: QualificationDocument = {
					id: uuidv4(),
					type: metaValidation.data.type,
					title: metaValidation.data.title,
					description: metaValidation.data.description,
					document: {
						publicId: uploadResult.publicId,
						url: uploadResult.url,
						filename: uploadResult.filename,
						mimeType: uploadResult.mimeType,
						size: uploadResult.size,
						uploadedAt: new Date(),
						originalName: uploadResult.filename,
						hash: uploadResult.hash,
					},
					uploadedAt: new Date(),
				};

				newQualifications.push(qualification);
			}

			// Add to nurse qualifications
			nurse.qualifications.push(...newQualifications);
			await nurse.save();

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					qualifications: newQualifications,
					totalQualifications: nurse.qualifications.length,
				},
				'Qualifications added successfully'
			);
		} catch (error) {
			console.error('Error adding qualifications:', error);
			return next(error);
		}
	}
);

/**
 * DELETE /nurse-portal/qualifications/:qualificationId
 * Delete a qualification document
 */
router.delete(
	'/qualifications/:qualificationId',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const { qualificationId } = req.params;

			const qualificationIndex = nurse.qualifications.findIndex(
				(q: QualificationDocument) => q.id === qualificationId
			);

			if (qualificationIndex === -1) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Qualification not found');
			}

			const qualification = nurse.qualifications[qualificationIndex];

			// Delete file from disk
			if (qualification.document?.publicId) {
				await diskStorageService.deleteFile(qualification.document.publicId);
			}

			// Remove from array
			nurse.qualifications.splice(qualificationIndex, 1);
			await nurse.save();

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					deletedQualificationId: qualificationId,
					remainingQualifications: nurse.qualifications.length,
				},
				'Qualification deleted successfully'
			);
		} catch (error) {
			console.error('Error deleting qualification:', error);
			return next(error);
		}
	}
);

// ============================================================================
// NURSE APPOINTMENTS ROUTES
// ============================================================================

/**
 * GET /nurse-portal/appointments
 * Get all appointments assigned to this nurse
 */
router.get('/appointments', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = (req as any).nurse;
		const { status, page = 1, limit = 20 } = req.query;

		const query: any = {
			nurse: nurse._id,
		};

		if (status) {
			query.status = status;
		}

		const skip = (Number(page) - 1) * Number(limit);

		const [appointments, total] = await Promise.all([
			db.appointments
				.find(query)
				.populate('patient')
				.populate('payments')
				.sort({ date: -1 })
				.limit(Number(limit))
				.skip(skip),
			db.appointments.countDocuments(query),
		]);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				appointments,
				pagination: {
					page: Number(page),
					limit: Number(limit),
					total,
					pages: Math.ceil(total / Number(limit)),
				},
			},
			'Appointments retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching nurse appointments:', error);
		return next(error);
	}
});

/**
 * GET /nurse-portal/appointments/:id
 * Get specific appointment details
 */
router.get('/appointments/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = (req as any).nurse;
		const { id } = req.params;

		const appointment = await db.appointments
			.findOne({ _id: id, nurse: nurse._id })
			.populate('patient')
			.populate('payments');

		if (!appointment) {
			return sendNormalized(
				res,
				StatusCodes.NOT_FOUND,
				null,
				'Appointment not found or not assigned to you'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ appointment },
			'Appointment retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching appointment:', error);
		return next(error);
	}
});

/**
 * PATCH /nurse-portal/appointments/:id/status
 * Update appointment status
 */
router.patch(
	'/appointments/:id/status',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const { id } = req.params;
			const { status } = req.body;

			if (!status) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Status is required');
			}

			const allowedStatuses = ['in_progress', 'completed'];
			if (!allowedStatuses.includes(status)) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid status. Allowed: in_progress, completed'
				);
			}

			const appointment = await db.appointments.findOne({ _id: id, nurse: nurse._id });

			if (!appointment) {
				return sendNormalized(
					res,
					StatusCodes.NOT_FOUND,
					null,
					'Appointment not found or not assigned to you'
				);
			}

			appointment.status = status;
			await appointment.save();

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ appointment },
				'Appointment status updated successfully'
			);
		} catch (error) {
			console.error('Error updating appointment status:', error);
			return next(error);
		}
	}
);

/**
 * POST /nurse-portal/appointments/:id/initiate-payment
 * Initiate payment for an appointment
 */
router.post(
	'/appointments/:id/initiate-payment',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const { id } = req.params;
			const { amount, description } = req.body;

			if (!amount || amount <= 0) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Valid amount is required');
			}

			// Verify appointment is assigned to this nurse
			const appointment = await db.appointments
				.findOne({ _id: id, nurse: nurse._id })
				.populate('patient');

			if (!appointment) {
				return sendNormalized(
					res,
					StatusCodes.NOT_FOUND,
					null,
					'Appointment not found or not assigned to you'
				);
			}

			// Check if payment already exists
			const existingPayment = await db.payments.findOne({
				appointment: appointment._id,
				status: 'SUCCESSFUL',
			});

			if (existingPayment) {
				return sendNormalized(
					res,
					StatusCodes.CONFLICT,
					null,
					'Payment already completed for this appointment'
				);
			}

			// Get patient details
			const patient = appointment.patient as any;
			if (!patient || !patient.phone) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Patient phone number not available'
				);
			}

			// Initiate payment using collection service
			const collectionService = new CollectionService();
			const payment = await collectionService.createCollection({
				amount,
				phoneNumber: patient.phone,
				appointmentId: id,
				patientId: patient._id.toString(),
				description:
					description || `Payment for appointment with ${nurse.firstName} ${nurse.lastName}`,
			});

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					payment: {
						id: payment.id,
						amount: payment.amount,
						reference: payment.reference,
						status: payment.status,
						phoneNumber: payment.phoneNumber,
						paymentMethod: payment.paymentMethod,
						initiatedAt: payment.initiatedAt,
					},
				},
				'Payment initiated successfully. Patient will receive mobile money prompt.'
			);
		} catch (error: any) {
			console.error('Error initiating payment:', error);
			if (error.message) {
				return sendNormalized(
					res,
					error.statusCode || StatusCodes.BAD_REQUEST,
					null,
					error.message
				);
			}
			return next(error);
		}
	}
);

/**
 * GET /nurse-portal/appointments/:id/payments
 * Get all payments for an appointment
 */
router.get(
	'/appointments/:id/payments',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const nurse = (req as any).nurse;
			const { id } = req.params;

			// Verify appointment is assigned to this nurse
			const appointment = await db.appointments.findOne({ _id: id, nurse: nurse._id });

			if (!appointment) {
				return sendNormalized(
					res,
					StatusCodes.NOT_FOUND,
					null,
					'Appointment not found or not assigned to you'
				);
			}

			const payments = await db.payments.find({ appointment: id }).sort({ createdAt: -1 });

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ payments, count: payments.length },
				'Payments retrieved successfully'
			);
		} catch (error) {
			console.error('Error fetching appointment payments:', error);
			return next(error);
		}
	}
);

// ============================================================================
// NURSE STATISTICS
// ============================================================================

/**
 * GET /nurse-portal/statistics
 * Get nurse statistics (appointments, earnings, etc.)
 */
router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = (req as any).nurse;

		// Get appointment statistics
		const appointmentStats = await db.appointments.aggregate([
			{ $match: { nurse: nurse._id } },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		// Get payment/earnings statistics
		const earningsStats = await db.payments.aggregate([
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
					'appointmentDetails.nurse': nurse._id,
					status: 'SUCCESSFUL',
				},
			},
			{
				$group: {
					_id: null,
					totalEarnings: { $sum: '$amount' },
					totalPayments: { $sum: 1 },
				},
			},
		]);

		const totalAppointments = appointmentStats.reduce((acc, stat) => acc + stat.count, 0);
		const appointmentsByStatus = appointmentStats.reduce((acc: any, stat) => {
			acc[stat._id] = stat.count;
			return acc;
		}, {});

		const earnings = earningsStats[0] || { totalEarnings: 0, totalPayments: 0 };

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				appointments: {
					total: totalAppointments,
					byStatus: appointmentsByStatus,
				},
				earnings: {
					total: earnings.totalEarnings,
					successfulPayments: earnings.totalPayments,
				},
			},
			'Statistics retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching nurse statistics:', error);
		return next(error);
	}
});

export default router;
