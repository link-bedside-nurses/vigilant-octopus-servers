import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import authenticate from '../middlewares/authentication';
import {
	accountDeletionService,
	DeletionRequest,
	handleDeletionResponse,
} from '../services/account-deletion';
import { accountDeletionPage } from '../utils/account-deletion-page';
import { normalizedResponse } from '../utils/http-response';

const router = Router();

// Public routes (no authentication required)

/**
 * GET /account-deletion
 * Public page for account deletion (Google Play Store compliance)
 */
router.get('/', (req: Request, res: Response) => {
	res.setHeader('Content-Type', 'text/html');
	res.send(accountDeletionPage);
});

/**
 * POST /account-deletion/request
 * Public endpoint for requesting account deletion (Google Play Store compliance)
 */
router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, phone, reason, confirmation } = req.body;

		const deletionRequest = {
			email,
			phone,
			reason,
			source: 'web' as const,
			confirmation: !!confirmation,
		} as DeletionRequest;

		const deletionResponse = await accountDeletionService.requestAccountDeletion(deletionRequest);
		handleDeletionResponse(res, deletionResponse);
	} catch (err) {
		return next(err);
	}
});

// Authenticated routes

/**
 * GET /account-deletion/status
 * Get deletion status for authenticated user
 */
router.get('/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accountId = req.account?.id;
		const accountType = req.account?.type;

		if (!accountId || !accountType) {
			return res.send(
				normalizedResponse(StatusCodes.UNAUTHORIZED, null, 'Account information not found')
			);
		}

		const deletionResponse = await accountDeletionService.getDeletionStatus(accountId, accountType);
		handleDeletionResponse(res, deletionResponse);
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /account-deletion/cancel
 * Cancel account deletion request for authenticated user
 */
router.post('/cancel', authenticate, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accountId = req.account?.id;
		const accountType = req.account?.type;

		if (!accountId || !accountType) {
			return res.send(
				normalizedResponse(StatusCodes.UNAUTHORIZED, null, 'Account information not found')
			);
		}

		const deletionResponse = await accountDeletionService.cancelAccountDeletion(
			accountId,
			accountType
		);
		handleDeletionResponse(res, deletionResponse);
	} catch (err) {
		return next(err);
	}
});

/**
 * POST /account-deletion/request-authenticated
 * Request account deletion for authenticated user (mobile app)
 */
router.post(
	'/request-authenticated',
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountId = req.account?.id;
			const accountType = req.account?.type;
			const { reason, confirmation } = req.body;

			if (!accountId || !accountType) {
				return res.send(
					normalizedResponse(StatusCodes.UNAUTHORIZED, null, 'Account information not found')
				);
			}

			// Get account details to find email/phone
			let email: string | undefined, phone: string | undefined;

			if (accountType === 'nurse') {
				const nurse = await db.nurses.findById(accountId);
				if (nurse) {
					email = nurse.email;
					phone = nurse.phone;
				}
			} else if (accountType === 'patient') {
				const patient = await db.patients.findById(accountId);
				if (patient) {
					phone = patient.phone;
				}
			} else if (accountType === 'admin') {
				const admin = await db.admins.findById(accountId);
				if (admin) {
					email = admin.email;
				}
			}

			const deletionRequest = {
				email,
				phone,
				reason,
				source: 'mobile' as const,
				confirmation: !!confirmation,
			};

			const deletionResponse = await accountDeletionService.requestAccountDeletion(deletionRequest);
			handleDeletionResponse(res, deletionResponse);
		} catch (err) {
			return next(err);
		}
	}
);

// Admin routes

/**
 * GET /account-deletion/admin/pending
 * Get all pending deletion requests (admin only)
 */
router.get(
	'/admin/pending',
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountType = req.account?.type;

			if (accountType !== 'admin') {
				return res.send(normalizedResponse(StatusCodes.FORBIDDEN, null, 'Admin access required'));
			}

			// Get all accounts marked for deletion
			const nurses = await db.nurses.find({ markedForDeletion: true }).select('-password');
			const patients = await db.patients.find({ markedForDeletion: true });
			const admins = await db.admins.find({ markedForDeletion: true }).select('-password');

			const pendingDeletions = {
				nurses: nurses.map((nurse: any) => ({
					id: nurse.id,
					type: 'nurse',
					name: `${nurse.firstName} ${nurse.lastName}`,
					email: nurse.email,
					phone: nurse.phone,
					deletionRequestDate: nurse.deletionRequestDate,
					deletionReason: nurse.deletionReason,
					deletionRequestSource: nurse.deletionRequestSource,
					estimatedDeletionDate: nurse.deletionRequestDate
						? new Date(nurse.deletionRequestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
						: null,
				})),
				patients: patients.map((patient: any) => ({
					id: patient.id,
					type: 'patient',
					name: patient.name,
					phone: patient.phone,
					deletionRequestDate: patient.deletionRequestDate,
					deletionReason: patient.deletionReason,
					deletionRequestSource: patient.deletionRequestSource,
					estimatedDeletionDate: patient.deletionRequestDate
						? new Date(patient.deletionRequestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
						: null,
				})),
				admins: admins.map((admin: any) => ({
					id: admin.id,
					type: 'admin',
					name: admin.email, // Admin only has email, no firstName/lastName
					email: admin.email,
					deletionRequestDate: admin.deletionRequestDate,
					deletionReason: admin.deletionReason,
					deletionRequestSource: admin.deletionRequestSource,
					estimatedDeletionDate: admin.deletionRequestDate
						? new Date(admin.deletionRequestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
						: null,
				})),
			};

			return res.send(
				normalizedResponse(
					StatusCodes.OK,
					pendingDeletions,
					'Pending deletion requests retrieved successfully'
				)
			);
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * POST /account-deletion/admin/force-delete
 * Force delete an account immediately (admin only)
 */
router.post(
	'/admin/force-delete',
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const adminId = req.account?.id;
			const accountType = req.account?.type;
			const { accountId, targetAccountType } = req.body;

			if (accountType !== 'admin') {
				return res.send(normalizedResponse(StatusCodes.FORBIDDEN, null, 'Admin access required'));
			}

			if (!accountId || !targetAccountType) {
				return res.send(
					normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Account ID and type are required')
				);
			}

			if (!['nurse', 'patient', 'admin'].includes(targetAccountType)) {
				return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Invalid account type'));
			}

			const deletionResponse = await accountDeletionService.forceDeleteAccount(
				accountId,
				targetAccountType,
				adminId!
			);
			handleDeletionResponse(res, deletionResponse);
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * POST /account-deletion/admin/cancel
 * Cancel deletion request for any account (admin only)
 */
router.post(
	'/admin/cancel',
	authenticate,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accountType = req.account?.type;
			const { accountId, targetAccountType } = req.body;

			if (accountType !== 'admin') {
				return res.send(normalizedResponse(StatusCodes.FORBIDDEN, null, 'Admin access required'));
			}

			if (!accountId || !targetAccountType) {
				return res.send(
					normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Account ID and type are required')
				);
			}

			if (!['nurse', 'patient', 'admin'].includes(targetAccountType)) {
				return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Invalid account type'));
			}

			const deletionResponse = await accountDeletionService.cancelAccountDeletion(
				accountId,
				targetAccountType
			);
			handleDeletionResponse(res, deletionResponse);
		} catch (err) {
			return next(err);
		}
	}
);

export default router;
