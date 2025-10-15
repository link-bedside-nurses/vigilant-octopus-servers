import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { APPOINTMENT_STATUSES, DOCUMENT_VERIFICATION_STATUS } from '../interfaces';
import authenticate from '../middlewares/authentication';
import { ChannelType, messagingService } from '../services/messaging';
import { sendNormalized } from '../utils/http-response';

const router = Router();

// Public route - Get all nurses (with optional filters)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { isVerified, isActive, documentVerificationStatus } = req.query;

		const query: any = {};
		if (isVerified !== undefined) query.isVerified = isVerified === 'true';
		if (isActive !== undefined) query.isActive = isActive === 'true';
		if (documentVerificationStatus) query.documentVerificationStatus = documentVerificationStatus;

		const nurses = await db.nurses.find(query).sort({ createdAt: 'desc' });
		return sendNormalized(res, StatusCodes.OK, nurses, 'Nurses fetched successfully');
	} catch (err) {
		return next(err);
	}
});

// Public route - Get nurse by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = await db.nurses.findById(req.params.id);
		if (!nurse) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');
		return sendNormalized(res, StatusCodes.OK, nurse, 'Nurse fetched successfully');
	} catch (err) {
		return next(err);
	}
});

// Protected routes - require authentication
router.use(authenticate);

// Middleware to verify admin access
const verifyAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
	const account = req.account;

	if (account?.type !== 'admin') {
		return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Admin access required');
	}

	return next();
};

// Admin only routes
router.use(verifyAdminAccess);

// PATCH /nurses/:id - Update nurse (admin only)
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { firstName, lastName, email, phone, isActive, isVerified } = req.body;

		const updateData: any = {};
		if (firstName) updateData.firstName = firstName;
		if (lastName) updateData.lastName = lastName;
		if (email) updateData.email = email;
		if (phone) updateData.phone = phone;
		if (isActive !== undefined) updateData.isActive = isActive;
		if (isVerified !== undefined) updateData.isVerified = isVerified;

		const nurse = await db.nurses.findByIdAndUpdate(req.params.id, updateData, { new: true });

		if (!nurse) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');

		return sendNormalized(res, StatusCodes.OK, nurse, 'Nurse updated successfully');
	} catch (err) {
		return next(err);
	}
});

// PATCH /nurses/:id/activate - Activate nurse account (admin only)
router.patch('/:id/activate', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ $set: { isActive: true } },
			{ new: true }
		);

		if (!nurse) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');

		// Send activation notification if email is available
		if (nurse.email) {
			await messagingService.sendNotification(nurse.email, '', {
				channel: ChannelType.EMAIL,
				template: {
					subject: 'Nurse Account Activated',
					text: `Hello ${nurse.firstName}, your nurse account has been activated. You can now sign in.`,
					html: `<p>Hello ${nurse.firstName},</p><p>Your nurse account has been activated. You can now sign in to the LinkBedside Nurses portal.</p>`,
				},
			});
		}

		return sendNormalized(res, StatusCodes.OK, nurse, 'Nurse activated successfully');
	} catch (err) {
		return next(err);
	}
});

// PATCH /nurses/:id/deactivate - Deactivate nurse account (admin only)
router.patch('/:id/deactivate', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ $set: { isActive: false } },
			{ new: true }
		);

		if (!nurse) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');

		// Cancel pending and in-progress appointments
		await db.appointments.updateMany(
			{
				nurse: req.params.id,
				status: { $in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS] },
			},
			{
				$set: {
					status: APPOINTMENT_STATUSES.CANCELLED,
					cancellationReason: 'Nurse account deactivated',
				},
			}
		);

		// Send deactivation notification if email is available
		if (nurse.email) {
			await messagingService.sendNotification(nurse.email, '', {
				channel: ChannelType.EMAIL,
				template: {
					subject: 'Nurse Account Deactivated',
					text: `Hello ${nurse.firstName}, your nurse account has been deactivated. Please contact support for more information.`,
					html: `<p>Hello ${nurse.firstName},</p><p>Your nurse account has been deactivated. Please contact support for more information.</p>`,
				},
			});
		}

		return sendNormalized(res, StatusCodes.OK, nurse, 'Nurse deactivated successfully');
	} catch (err) {
		return next(err);
	}
});

// PATCH /nurses/:id/verification-status - Update document verification status (admin only)
router.patch(
	'/:id/verification-status',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { status } = req.body;

			if (!Object.values(DOCUMENT_VERIFICATION_STATUS).includes(status)) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid status. Must be ' + Object.values(DOCUMENT_VERIFICATION_STATUS).join(', ')
				);
			}

			const updateData: any = {
				documentVerificationStatus: status,
			};

			// If documents are verified, also set isVerified to true
			if (status === DOCUMENT_VERIFICATION_STATUS.VERIFIED) {
				updateData.isVerified = true;
				updateData.isActive = true; // Auto-activate when verified
			}

			// If documents are rejected, set isVerified to false
			if (status === DOCUMENT_VERIFICATION_STATUS.REJECTED) {
				updateData.isVerified = false;
				updateData.isActive = false; // Deactivate when rejected
			}

			const nurse = await db.nurses.findByIdAndUpdate(id, { $set: updateData }, { new: true });

			if (!nurse) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');
			}

			// Send notification based on status
			if (nurse.email) {
				if (status === DOCUMENT_VERIFICATION_STATUS.VERIFIED) {
					await messagingService.sendNotification(nurse.email, '', {
						channel: ChannelType.EMAIL,
						template: {
							subject: 'Your Documents Have Been Verified',
							text: `Hello ${nurse.firstName}, your documents have been verified. You can now sign in to your account.`,
							html: `<p>Hello ${nurse.firstName},</p><p>Your documents have been verified and your account has been activated. You can now sign in to the LinkBedside Nurses portal.</p>`,
						},
					});
				} else if (status === DOCUMENT_VERIFICATION_STATUS.REJECTED) {
					await messagingService.sendNotification(nurse.email, '', {
						channel: ChannelType.EMAIL,
						template: {
							subject: 'Document Verification Update',
							text: `Hello ${nurse.firstName}, unfortunately your documents could not be verified. Please contact support for more information.`,
							html: `<p>Hello ${nurse.firstName},</p><p>Unfortunately, your submitted documents could not be verified. Please contact support for more information.</p>`,
						},
					});
				}
			}

			return sendNormalized(res, StatusCodes.OK, nurse, 'Verification status updated successfully');
		} catch (err) {
			return next(err);
		}
	}
);

// GET /nurses/:id/appointments - Get nurse appointments (admin only)
router.get('/:id/appointments', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { status } = req.query;

		const query: any = { nurse: req.params.id };
		if (status) query.status = status;

		const appointments = await db.appointments
			.find(query)
			.populate('patient')
			.populate('nurse')
			.populate('payments')
			.sort({ date: -1 });

		return sendNormalized(res, StatusCodes.OK, appointments, 'Appointments fetched successfully');
	} catch (err) {
		return next(err);
	}
});

// GET /nurses/:id/statistics - Get nurse statistics (admin only)
router.get('/:id/statistics', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurseId = req.params.id;

		// Verify nurse exists
		const nurse = await db.nurses.findById(nurseId);
		if (!nurse) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');
		}

		// Get appointment statistics
		const [totalAppointments, completedAppointments, cancelledAppointments, earnings] =
			await Promise.all([
				db.appointments.countDocuments({ nurse: nurseId }),
				db.appointments.countDocuments({ nurse: nurseId, status: APPOINTMENT_STATUSES.COMPLETED }),
				db.appointments.countDocuments({ nurse: nurseId, status: APPOINTMENT_STATUSES.CANCELLED }),
				db.payments.aggregate([
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
				]),
			]);

		const earningsData = earnings[0] || { totalEarnings: 0, totalPayments: 0 };

		const statistics = {
			totalAppointments,
			completedAppointments,
			cancelledAppointments,
			totalEarnings: earningsData.totalEarnings,
			successfulPayments: earningsData.totalPayments,
		};

		return sendNormalized(res, StatusCodes.OK, statistics, 'Statistics fetched successfully');
	} catch (err) {
		return next(err);
	}
});

// DELETE /nurses/:id - Delete nurse (admin only)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const nurse = await db.nurses.findById(req.params.id);

		if (!nurse) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse not found');
		}

		// Cancel all pending and in-progress appointments
		await db.appointments.updateMany(
			{
				nurse: req.params.id,
				status: {
					$in: [
						APPOINTMENT_STATUSES.PENDING,
						APPOINTMENT_STATUSES.ASSIGNED,
						APPOINTMENT_STATUSES.IN_PROGRESS,
					],
				},
			},
			{
				$set: {
					status: APPOINTMENT_STATUSES.CANCELLED,
					cancellationReason: 'Nurse account deleted',
					cancelledAt: new Date(),
				},
			}
		);

		// Delete the nurse
		await db.nurses.findByIdAndDelete(req.params.id);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ id: nurse.id, firstName: nurse.firstName, lastName: nurse.lastName },
			'Nurse deleted successfully'
		);
	} catch (err) {
		return next(err);
	}
});

export default router;
