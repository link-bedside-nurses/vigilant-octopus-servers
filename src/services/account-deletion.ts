import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { sendNormalized } from '../utils/http-response';
import logger from '../utils/logger';
import { fileUploadService } from './upload';

// Account deletion request interface
export interface DeletionRequest {
	email?: string;
	phone?: string;
	reason?: string;
	source: 'web' | 'mobile' | 'admin';
	confirmation?: boolean;
}

// Account deletion response interface
export interface DeletionResponse {
	success: boolean;
	message: string;
	data?: any;
	errors?: string[];
}

class AccountDeletionService {
	private static instance: AccountDeletionService;

	private constructor() {}

	public static getInstance(): AccountDeletionService {
		if (!AccountDeletionService.instance) {
			AccountDeletionService.instance = new AccountDeletionService();
		}
		return AccountDeletionService.instance;
	}

	/**
	 * Request account deletion (Google Play Store compliant)
	 */
	public async requestAccountDeletion(request: DeletionRequest): Promise<DeletionResponse> {
		try {
			const { email, phone, reason, source, confirmation } = request;

			// Validate request
			if (!confirmation) {
				return {
					success: false,
					message: 'Account deletion confirmation is required',
				};
			}

			if (!email && !phone) {
				return {
					success: false,
					message: 'Either email or phone number is required',
				};
			}

			// Find account by email or phone
			let account = null;
			let accountType = '';

			if (email) {
				// Check for nurse account
				account = await db.nurses.findOne({ email });
				if (account) {
					accountType = 'nurse';
				} else {
					// Check for admin account
					account = await db.admins.findOne({ email });
					if (account) {
						accountType = 'admin';
					}
				}
			}

			if (phone && !account) {
				// Check for nurse account
				account = await db.nurses.findOne({ phone });
				if (account) {
					accountType = 'nurse';
				} else {
					// Check for patient account
					account = await db.patients.findOne({ phone });
					if (account) {
						accountType = 'patient';
					}
				}
			}

			if (!account) {
				return {
					success: false,
					message: 'Account not found with the provided email or phone number',
				};
			}

			// Check if already marked for deletion
			if (account.markedForDeletion) {
				return {
					success: false,
					message: 'Account is already marked for deletion',
				};
			}

			// Mark account for deletion
			account.markedForDeletion = true;
			account.deletionRequestDate = new Date();
			account.deletionReason = reason || 'User requested account deletion';
			account.deletionRequestSource = source;

			await account.save();

			logger.info(`Account deletion requested for ${accountType} ${account.id} via ${source}`);

			return {
				success: true,
				message:
					'Account deletion request submitted successfully. Your account will be deleted within 7 days.',
				data: {
					accountId: account.id,
					accountType,
					deletionRequestDate: account.deletionRequestDate,
					estimatedDeletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
				},
			};
		} catch (error) {
			logger.error('Account deletion request failed:', error);
			return {
				success: false,
				message: 'Failed to process account deletion request',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Cancel account deletion request
	 */
	public async cancelAccountDeletion(
		accountId: string,
		accountType: 'nurse' | 'patient' | 'admin'
	): Promise<DeletionResponse> {
		try {
			let account = null;

			switch (accountType) {
				case 'nurse':
					account = await db.nurses.findById(accountId);
					break;
				case 'patient':
					account = await db.patients.findById(accountId);
					break;
				case 'admin':
					account = await db.admins.findById(accountId);
					break;
			}

			if (!account) {
				return {
					success: false,
					message: 'Account not found',
				};
			}

			if (!account.markedForDeletion) {
				return {
					success: false,
					message: 'Account is not marked for deletion',
				};
			}

			// Cancel deletion request
			account.markedForDeletion = false;
			account.deletionRequestDate = undefined;
			account.deletionReason = undefined;
			account.deletionRequestSource = undefined;

			await account.save();

			logger.info(`Account deletion cancelled for ${accountType} ${accountId}`);

			return {
				success: true,
				message: 'Account deletion request cancelled successfully',
				data: {
					accountId: account.id,
					accountType,
				},
			};
		} catch (error) {
			logger.error('Account deletion cancellation failed:', error);
			return {
				success: false,
				message: 'Failed to cancel account deletion request',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get account deletion status
	 */
	public async getDeletionStatus(
		accountId: string,
		accountType: 'nurse' | 'patient' | 'admin'
	): Promise<DeletionResponse> {
		try {
			let account = null;

			switch (accountType) {
				case 'nurse':
					account = await db.nurses.findById(accountId);
					break;
				case 'patient':
					account = await db.patients.findById(accountId);
					break;
				case 'admin':
					account = await db.admins.findById(accountId);
					break;
			}

			if (!account) {
				return {
					success: false,
					message: 'Account not found',
				};
			}

			const status = {
				accountId: account.id,
				accountType,
				markedForDeletion: account.markedForDeletion || false,
				deletionRequestDate: account.deletionRequestDate,
				deletionReason: account.deletionReason,
				deletionRequestSource: account.deletionRequestSource,
				estimatedDeletionDate: account.deletionRequestDate
					? new Date(account.deletionRequestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
					: null,
				canCancel: account.markedForDeletion && !account.deletionConfirmed,
			};

			return {
				success: true,
				message: 'Account deletion status retrieved successfully',
				data: status,
			};
		} catch (error) {
			logger.error('Failed to get account deletion status:', error);
			return {
				success: false,
				message: 'Failed to get account deletion status',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Process account deletions (called by cron job)
	 */
	public async processAccountDeletions(): Promise<void> {
		try {
			logger.info('Running account deletion job');

			// Get the date 7 days ago
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - 7);

			// Find accounts marked for deletion older than 7 days
			const nursesToDelete = await db.nurses.find({
				markedForDeletion: true,
				deletionRequestDate: { $lte: cutoffDate },
			});

			const patientsToDelete = await db.patients.find({
				markedForDeletion: true,
				deletionRequestDate: { $lte: cutoffDate },
			});

			const adminsToDelete = await db.admins.find({
				markedForDeletion: true,
				deletionRequestDate: { $lte: cutoffDate },
			});

			logger.info(
				`Found ${nursesToDelete.length} nurses, ${patientsToDelete.length} patients, and ${adminsToDelete.length} admins to delete`
			);

			// Delete nurses and their documents
			for (const nurse of nursesToDelete) {
				logger.info(`Deleting nurse: ${nurse.id}`);

				// Clean up documents first
				await fileUploadService.cleanupNurseDocuments(nurse.id.toString());

				// Cancel any pending appointments
				await db.appointments.updateMany(
					{ nurse: nurse.id },
					{
						$set: {
							status: 'cancelled',
							cancellationReason: 'Nurse account deleted',
						},
					}
				);

				await db.nurses.findByIdAndDelete(nurse.id);
			}

			// Delete patients
			for (const patient of patientsToDelete) {
				logger.info(`Deleting patient: ${patient.id}`);

				// Cancel any pending appointments
				await db.appointments.updateMany(
					{ patient: patient.id },
					{
						$set: {
							status: 'cancelled',
							cancellationReason: 'Patient account deleted',
						},
					}
				);

				await db.patients.findByIdAndDelete(patient.id);
			}

			// Delete admins
			for (const admin of adminsToDelete) {
				logger.info(`Deleting admin: ${admin.id}`);
				await db.admins.findByIdAndDelete(admin.id);
			}

			logger.info(
				`Successfully deleted ${nursesToDelete.length} nurses, ${patientsToDelete.length} patients, and ${adminsToDelete.length} admins`
			);
		} catch (error) {
			logger.error('Error processing account deletions:', error);
		}
	}

	/**
	 * Admin: Force delete account immediately
	 */
	public async forceDeleteAccount(
		accountId: string,
		accountType: 'nurse' | 'patient' | 'admin',
		adminId: string
	): Promise<DeletionResponse> {
		try {
			let account = null;

			switch (accountType) {
				case 'nurse':
					account = await db.nurses.findById(accountId);
					break;
				case 'patient':
					account = await db.patients.findById(accountId);
					break;
				case 'admin':
					account = await db.admins.findById(accountId);
					break;
			}

			if (!account) {
				return {
					success: false,
					message: 'Account not found',
				};
			}

			// Mark as confirmed deletion
			account.deletionConfirmed = true;
			account.deletionConfirmedDate = new Date();
			account.deletionConfirmedBy = adminId;
			await account.save();

			// Delete immediately
			if (accountType === 'nurse') {
				await fileUploadService.cleanupNurseDocuments(accountId);
			}

			// Cancel appointments
			await db.appointments.updateMany(
				{ $or: [{ nurse: accountId }, { patient: accountId }] },
				{
					$set: {
						status: 'cancelled',
						cancellationReason: `${accountType} account deleted by admin`,
					},
				}
			);

			// Delete the account
			switch (accountType) {
				case 'nurse':
					await db.nurses.findByIdAndDelete(accountId);
					break;
				case 'patient':
					await db.patients.findByIdAndDelete(accountId);
					break;
				case 'admin':
					await db.admins.findByIdAndDelete(accountId);
					break;
			}

			logger.info(`Account ${accountId} (${accountType}) force deleted by admin ${adminId}`);

			return {
				success: true,
				message: `${accountType} account deleted successfully`,
				data: {
					accountId,
					accountType,
					deletedBy: adminId,
					deletedAt: new Date(),
				},
			};
		} catch (error) {
			logger.error('Force account deletion failed:', error);
			return {
				success: false,
				message: 'Failed to delete account',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}
}

// Export singleton instance
export const accountDeletionService = AccountDeletionService.getInstance();

// Express middleware for handling deletion responses
export const handleDeletionResponse = (res: Response, deletionResponse: DeletionResponse) => {
	if (deletionResponse.success) {
		return sendNormalized(res, StatusCodes.OK, deletionResponse.data, deletionResponse.message);
	} else {
		return sendNormalized(res, StatusCodes.BAD_REQUEST, null, deletionResponse.message);
	}
};
