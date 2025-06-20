import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { normalizedResponse } from '../utils/http-response';
import logger from '../utils/logger';
import { cloudinaryService, DocumentType, UploadOptions } from './cloudinary';

// File upload middleware options
export interface FileUploadOptions {
	maxFiles?: number;
	maxFileSize?: number; // in bytes
	allowedFormats?: string[];
	documentType: DocumentType;
	folder?: string;
}

// Upload response interface
export interface UploadResponse {
	success: boolean;
	message: string;
	data?: any;
	errors?: string[];
}

class FileUploadService {
	private static instance: FileUploadService;

	private constructor() {}

	public static getInstance(): FileUploadService {
		if (!FileUploadService.instance) {
			FileUploadService.instance = new FileUploadService();
		}
		return FileUploadService.instance;
	}

	/**
	 * Upload nurse profile picture
	 */
	public async uploadNurseProfilePicture(
		nurseId: string,
		file: Express.Multer.File
	): Promise<UploadResponse> {
		try {
			// Check if nurse exists
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			// Upload to Cloudinary
			const uploadOptions: UploadOptions = {
				folder: `nurses/${nurseId}/profile`,
				allowedFormats: ['jpg', 'jpeg', 'png'],
				maxFileSize: 5 * 1024 * 1024, // 5MB
				resourceType: 'image',
			};

			const result = await cloudinaryService.uploadFile(
				file,
				DocumentType.PROFILE_PICTURE,
				uploadOptions
			);

			// Delete old profile picture if exists
			if (nurse.profilePicture?.publicId) {
				await cloudinaryService.deleteFile(nurse.profilePicture.publicId, 'image');
			}

			// Update nurse profile picture
			nurse.profilePicture = {
				publicId: result.publicId,
				url: result.url,
				secureUrl: result.secureUrl,
				format: result.format,
				resourceType: result.resourceType,
				size: result.size,
				uploadedAt: result.uploadedAt,
				originalName: result.originalName,
			};

			await nurse.save();

			logger.info(`Profile picture uploaded for nurse ${nurseId}: ${result.publicId}`);

			return {
				success: true,
				message: 'Profile picture uploaded successfully',
				data: {
					nurseId,
					profilePicture: nurse.profilePicture,
				},
			};
		} catch (error) {
			logger.error('Profile picture upload failed:', error);
			return {
				success: false,
				message: 'Profile picture upload failed',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Upload nurse national ID documents
	 */
	public async uploadNurseNationalID(
		nurseId: string,
		frontFile: Express.Multer.File,
		backFile: Express.Multer.File
	): Promise<UploadResponse> {
		try {
			// Check if nurse exists
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			const uploadOptions: UploadOptions = {
				folder: `nurses/${nurseId}/national-id`,
				allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
				maxFileSize: 10 * 1024 * 1024, // 10MB
			};

			// Upload both files
			const [frontResult, backResult] = await Promise.all([
				cloudinaryService.uploadFile(frontFile, DocumentType.NATIONAL_ID, {
					...uploadOptions,
					publicId: `${nurseId}_national_id_front`,
				}),
				cloudinaryService.uploadFile(backFile, DocumentType.NATIONAL_ID, {
					...uploadOptions,
					publicId: `${nurseId}_national_id_back`,
				}),
			]);

			// Delete old documents if they exist
			if (nurse.nationalId?.front?.publicId) {
				await cloudinaryService.deleteFile(nurse.nationalId.front.publicId);
			}
			if (nurse.nationalId?.back?.publicId) {
				await cloudinaryService.deleteFile(nurse.nationalId.back.publicId);
			}

			// Update nurse national ID documents
			nurse.nationalId = {
				front: {
					publicId: frontResult.publicId,
					url: frontResult.url,
					secureUrl: frontResult.secureUrl,
					format: frontResult.format,
					resourceType: frontResult.resourceType,
					size: frontResult.size,
					uploadedAt: frontResult.uploadedAt,
					originalName: frontResult.originalName,
				},
				back: {
					publicId: backResult.publicId,
					url: backResult.url,
					secureUrl: backResult.secureUrl,
					format: backResult.format,
					resourceType: backResult.resourceType,
					size: backResult.size,
					uploadedAt: backResult.uploadedAt,
					originalName: backResult.originalName,
				},
			};

			// Reset verification status since new documents were uploaded
			nurse.documentVerificationStatus = 'pending';

			await nurse.save();

			logger.info(`National ID documents uploaded for nurse ${nurseId}`);

			return {
				success: true,
				message: 'National ID documents uploaded successfully',
				data: {
					nurseId,
					nationalId: nurse.nationalId,
				},
			};
		} catch (error) {
			logger.error('National ID upload failed:', error);
			return {
				success: false,
				message: 'National ID upload failed',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Upload nurse qualification documents
	 */
	public async uploadNurseQualification(
		nurseId: string,
		file: Express.Multer.File,
		title: string,
		type: 'certification' | 'cv' | 'other' = 'certification',
		description?: string
	): Promise<UploadResponse> {
		try {
			// Check if nurse exists
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			const uploadOptions: UploadOptions = {
				folder: `nurses/${nurseId}/qualifications`,
				allowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
				maxFileSize: 15 * 1024 * 1024, // 15MB
			};

			const result = await cloudinaryService.uploadFile(
				file,
				DocumentType.CERTIFICATION,
				uploadOptions
			);

			// Create qualification document
			const qualificationDocument = {
				id: result.publicId,
				type,
				document: {
					publicId: result.publicId,
					url: result.url,
					secureUrl: result.secureUrl,
					format: result.format,
					resourceType: result.resourceType,
					size: result.size,
					uploadedAt: result.uploadedAt,
					originalName: result.originalName,
				},
				title,
				description,
				uploadedAt: new Date(),
			};

			// Add to nurse qualifications
			nurse.qualifications.push(qualificationDocument);
			await nurse.save();

			logger.info(`Qualification document uploaded for nurse ${nurseId}: ${result.publicId}`);

			return {
				success: true,
				message: 'Qualification document uploaded successfully',
				data: {
					nurseId,
					qualification: qualificationDocument,
				},
			};
		} catch (error) {
			logger.error('Qualification upload failed:', error);
			return {
				success: false,
				message: 'Qualification upload failed',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Delete nurse qualification document
	 */
	public async deleteNurseQualification(
		nurseId: string,
		qualificationId: string
	): Promise<UploadResponse> {
		try {
			// Check if nurse exists
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			// Find the qualification
			const qualificationIndex = nurse.qualifications.findIndex((q) => q.id === qualificationId);
			if (qualificationIndex === -1) {
				return {
					success: false,
					message: 'Qualification document not found',
				};
			}

			const qualification = nurse.qualifications[qualificationIndex];

			// Delete from Cloudinary
			await cloudinaryService.deleteFile(
				qualification.document.publicId,
				qualification.document.resourceType
			);

			// Remove from nurse qualifications
			nurse.qualifications.splice(qualificationIndex, 1);
			await nurse.save();

			logger.info(`Qualification document deleted for nurse ${nurseId}: ${qualificationId}`);

			return {
				success: true,
				message: 'Qualification document deleted successfully',
				data: {
					nurseId,
					deletedQualificationId: qualificationId,
				},
			};
		} catch (error) {
			logger.error('Qualification deletion failed:', error);
			return {
				success: false,
				message: 'Qualification deletion failed',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get nurse documents summary
	 */
	public async getNurseDocumentsSummary(nurseId: string): Promise<UploadResponse> {
		try {
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			const summary = {
				nurseId,
				hasProfilePicture: !!nurse.profilePicture,
				hasNationalID: !!nurse.nationalId,
				qualificationsCount: nurse.qualifications?.length || 0,
				documentVerificationStatus: nurse.documentVerificationStatus,
				documents: {
					profilePicture: nurse.profilePicture
						? {
								url: nurse.profilePicture.secureUrl,
								size: nurse.profilePicture.size,
								uploadedAt: nurse.profilePicture.uploadedAt,
							}
						: null,
					nationalId: nurse.nationalId
						? {
								front: {
									url: nurse.nationalId.front.secureUrl,
									size: nurse.nationalId.front.size,
									uploadedAt: nurse.nationalId.front.uploadedAt,
								},
								back: {
									url: nurse.nationalId.back.secureUrl,
									size: nurse.nationalId.back.size,
									uploadedAt: nurse.nationalId.back.uploadedAt,
								},
							}
						: null,
					qualifications:
						nurse.qualifications?.map((q) => ({
							id: q.id,
							type: q.type,
							title: q.title,
							description: q.description,
							url: q.document.secureUrl,
							size: q.document.size,
							uploadedAt: q.uploadedAt,
						})) || [],
				},
			};

			return {
				success: true,
				message: 'Nurse documents summary retrieved successfully',
				data: summary,
			};
		} catch (error) {
			logger.error('Failed to get nurse documents summary:', error);
			return {
				success: false,
				message: 'Failed to get nurse documents summary',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Update document verification status (admin only)
	 */
	public async updateDocumentVerificationStatus(
		nurseId: string,
		status: 'pending' | 'verified' | 'rejected',
		adminId: string,
		notes?: string
	): Promise<UploadResponse> {
		try {
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			nurse.documentVerificationStatus = status;

			await nurse.save();

			logger.info(`Document verification status updated for nurse ${nurseId}: ${status}`);

			return {
				success: true,
				message: 'Document verification status updated successfully',
				data: {
					nurseId,
					status,
					notes,
				},
			};
		} catch (error) {
			logger.error('Failed to update verification status:', error);
			return {
				success: false,
				message: 'Failed to update verification status',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Clean up nurse documents when nurse is deleted
	 */
	public async cleanupNurseDocuments(nurseId: string): Promise<void> {
		try {
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) return;

			const deletePromises: Promise<boolean>[] = [];

			// Delete profile picture
			if (nurse.profilePicture?.publicId) {
				deletePromises.push(cloudinaryService.deleteFile(nurse.profilePicture.publicId, 'image'));
			}

			// Delete national ID documents
			if (nurse.nationalId?.front?.publicId) {
				deletePromises.push(cloudinaryService.deleteFile(nurse.nationalId.front.publicId));
			}
			if (nurse.nationalId?.back?.publicId) {
				deletePromises.push(cloudinaryService.deleteFile(nurse.nationalId.back.publicId));
			}

			// Delete qualification documents
			if (nurse.qualifications?.length) {
				nurse.qualifications.forEach((qualification) => {
					deletePromises.push(
						cloudinaryService.deleteFile(
							qualification.document.publicId,
							qualification.document.resourceType
						)
					);
				});
			}

			await Promise.all(deletePromises);
			logger.info(`Cleaned up documents for nurse ${nurseId}`);
		} catch (error) {
			logger.error(`Failed to cleanup documents for nurse ${nurseId}:`, error);
		}
	}
}

// Export singleton instance
export const fileUploadService = FileUploadService.getInstance();

// Express middleware for handling file upload responses
export const handleFileUploadResponse = (res: Response, uploadResponse: UploadResponse): void => {
	if (uploadResponse.success) {
		normalizedResponse(StatusCodes.OK, uploadResponse.data, uploadResponse.message);
	} else {
		normalizedResponse(StatusCodes.BAD_REQUEST, null, uploadResponse.message);
	}
};
