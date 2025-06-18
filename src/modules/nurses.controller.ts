import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../middlewares/authentication';
import {
	handleUploadError,
	uploadNationalID,
	uploadProfilePicture,
	uploadQualification,
	validateDocumentUpload,
	validateImageUpload,
} from '../middlewares/fileUpload';
import { fileUploadService, handleFileUploadResponse } from '../services/file-upload';
import { response } from '../utils/http-response';

const router = Router();

// General nurse routes
router.get('/', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const { latLng } = req.query;
		let nurses;
		if (latLng) {
			const latitude = latLng.toString().split(',')[0];
			const longitude = latLng.toString().split(',')[1];
			if (!latitude || !longitude) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					"Missing either latitude or longitude on the 'latLng' query key"
				);
			}
			nurses = await db.nurses.find({
				location: {
					$near: {
						$geometry: {
							type: 'Point',
							coordinates: [longitude, latitude],
						},
					},
				},
			});
		} else {
			nurses = await db.nurses.find({}).sort({ createdAt: 'desc' });
		}
		return response(StatusCodes.OK, nurses, 'Nurses fetched successfully');
	} catch (err) {
		return next(err);
	}
});

router.use(authenticate);

router.get('/:id', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const nurse = await db.nurses.findById(req.params.id);
		if (!nurse) return response(StatusCodes.NOT_FOUND, null, 'No nurse Found');
		return response(StatusCodes.OK, nurse, 'Nurse fetched successfully');
	} catch (err) {
		return next(err);
	}
});

router.patch('/:id', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const updated = req.body;
		const nurse = await db.nurses.findByIdAndUpdate(req.params.id, updated, { new: true });
		if (!nurse) return response(StatusCodes.NOT_FOUND, null, 'No nurse Found');
		return response(StatusCodes.OK, nurse, 'Nurse updated successfully');
	} catch (err) {
		return next(err);
	}
});

// File upload routes
router.post(
	'/:id/profile-picture',
	uploadProfilePicture,
	handleUploadError,
	validateImageUpload,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const file = (req as any).file;

			const uploadResponse = await fileUploadService.uploadNurseProfilePicture(id, file);
			handleFileUploadResponse(res, uploadResponse);
		} catch (err) {
			return next(err);
		}
	}
);

router.post(
	'/:id/national-id',
	uploadNationalID,
	handleUploadError,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const files = (req as any).files;

			if (!files || !files.front || !files.back) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Both front and back national ID images are required'
				);
			}

			const uploadResponse = await fileUploadService.uploadNurseNationalID(
				id,
				files.front[0],
				files.back[0]
			);
			handleFileUploadResponse(res, uploadResponse);
		} catch (err) {
			return next(err);
		}
	}
);

router.post(
	'/:id/qualifications',
	uploadQualification,
	handleUploadError,
	validateDocumentUpload,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { title, type, description } = req.body;
			const file = (req as any).file;

			if (!title) {
				return response(StatusCodes.BAD_REQUEST, null, 'Title is required');
			}

			const uploadResponse = await fileUploadService.uploadNurseQualification(
				id,
				file,
				title,
				type || 'certification',
				description
			);
			handleFileUploadResponse(res, uploadResponse);
		} catch (err) {
			return next(err);
		}
	}
);

router.delete(
	'/:id/qualifications/:qualificationId',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id, qualificationId } = req.params;

			const uploadResponse = await fileUploadService.deleteNurseQualification(id, qualificationId);
			handleFileUploadResponse(res, uploadResponse);
		} catch (err) {
			return next(err);
		}
	}
);

router.get('/:id/documents', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const uploadResponse = await fileUploadService.getNurseDocumentsSummary(id);
		handleFileUploadResponse(res, uploadResponse);
	} catch (err) {
		return next(err);
	}
});

// Admin only - Update document verification status
router.patch(
	'/:id/verification-status',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { status, notes } = req.body;
			const adminId = (req as any).account?.id;

			if (!adminId) {
				return response(StatusCodes.UNAUTHORIZED, null, 'Admin access required');
			}

			if (!['pending', 'verified', 'rejected'].includes(status)) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid status. Must be pending, verified, or rejected'
				);
			}

			const uploadResponse = await fileUploadService.updateDocumentVerificationStatus(
				id,
				status,
				adminId,
				notes
			);
			handleFileUploadResponse(res, uploadResponse);
		} catch (err) {
			return next(err);
		}
	}
);

router.delete('/:id', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		// Clean up documents first
		await fileUploadService.cleanupNurseDocuments(req.params.id);

		// Cancel any pending or in-progress appointments
		await db.appointments.updateMany(
			{ nurse: req.params.id, status: APPOINTMENT_STATUSES.PENDING },
			{
				$set: {
					status: APPOINTMENT_STATUSES.CANCELLED,
					cancellationReason: 'Nurse account deleted',
				},
			}
		);
		await db.appointments.updateMany(
			{ nurse: req.params.id, status: APPOINTMENT_STATUSES.IN_PROGRESS },
			{
				$set: {
					status: APPOINTMENT_STATUSES.CANCELLED,
					cancellationReason: 'Nurse account deleted',
				},
			}
		);
		// Delete the nurse document
		const nurse = await db.nurses.findByIdAndDelete(req.params.id);
		if (!nurse) return response(StatusCodes.NOT_FOUND, null, 'No nurse Found');
		return response(StatusCodes.OK, nurse, 'Nurse deleted successfully');
	} catch (err) {
		return next(err);
	}
});

// Appointment related routes
router.get('/:id/appointments', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const appointments = await db.appointments
			.find({ nurse: { _id: req.params.id } })
			.populate('patient')
			.populate('nurse');
		return response(StatusCodes.OK, appointments, 'Appointments fetched successfully');
	} catch (err) {
		return next(err);
	}
});

router.get('/:id/appointment-history', async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const appointments = await db.appointments
			.find({ nurse: { _id: req.params.id } })
			.populate('patient')
			.populate('nurse');
		const filteredAppointments = appointments.filter(
			(appointment: any) =>
				appointment.status === APPOINTMENT_STATUSES.COMPLETED ||
				appointment.status === APPOINTMENT_STATUSES.CANCELLED
		);
		return response(StatusCodes.OK, filteredAppointments, 'Appointments fetched successfully');
	} catch (err) {
		return next(err);
	}
});

router.post(
	'/appointments/:appointmentId/cancel',
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const { appointmentId } = req.params;
			const nurseId = (req as any).account?.id;
			if (!nurseId) return response(StatusCodes.UNAUTHORIZED, null, 'Unauthorized access');
			// Update appointment status
			const appointment = await db.appointments.findOneAndUpdate(
				{ _id: appointmentId, nurse: nurseId },
				{
					$set: {
						status: APPOINTMENT_STATUSES.CANCELLED,
						cancellationReason: 'Cancelled by nurse',
					},
				},
				{ new: true }
			);
			if (!appointment)
				return response(
					StatusCodes.NOT_FOUND,
					null,
					'Appointment not found or not assigned to this nurse'
				);
			return response(StatusCodes.OK, appointment, 'Appointment cancelled successfully');
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
