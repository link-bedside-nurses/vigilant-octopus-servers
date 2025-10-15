import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { DiskDocument, QualificationDocument } from '../database/models/Nurse';
import { ACCOUNT } from '../interfaces';
import {
	NurseOTPVerificationSchema,
	NursePhoneAuthSchema,
	NurseRegistrationSchema,
	QualificationSchema,
} from '../interfaces/dtos';
import {
	handleNurseUploadError,
	uploadNurseDocuments,
	validateNurseDocuments,
} from '../middlewares/nurse-upload.middleware';
import { diskStorageService } from '../services/disk-storage';
import { messagingService } from '../services/messaging';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';

const router = Router();

// ============================================================================
// NURSE AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /nurse-auth/register
 * Register a new nurse with documents
 */
router.post(
	'/register',
	uploadNurseDocuments,
	handleNurseUploadError,
	validateNurseDocuments,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validate registration data
			const result = NurseRegistrationSchema.safeParse(req.body);

			if (!result.success) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
					result.error
				);
			}

			const { firstName, lastName, phone, email } = result.data;

			// Check if nurse already exists
			const existingNurse = await db.nurses.findOne({ phone });
			if (existingNurse) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Nurse with this phone number already exists'
				);
			}

			// Check email uniqueness if provided
			if (email) {
				const existingEmail = await db.nurses.findOne({ email });
				if (existingEmail) {
					return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Email already in use');
				}
			}

			const files = req.files as { [fieldname: string]: Express.Multer.File[] };

			// Upload profile picture
			const profilePictureFile = files.profilePicture[0];
			const profilePictureResult = await diskStorageService.uploadFile(profilePictureFile);
			const profilePicture: DiskDocument = {
				publicId: profilePictureResult.publicId,
				url: profilePictureResult.url,
				filename: profilePictureResult.filename,
				mimeType: profilePictureResult.mimeType,
				size: profilePictureResult.size,
				uploadedAt: new Date(),
				originalName: profilePictureResult.filename,
				hash: profilePictureResult.hash,
			};

			// Upload national ID front
			const nationalIdFrontFile = files.nationalIdFront[0];
			const nationalIdFrontResult = await diskStorageService.uploadFile(nationalIdFrontFile);
			const nationalIdFront: DiskDocument = {
				publicId: nationalIdFrontResult.publicId,
				url: nationalIdFrontResult.url,
				filename: nationalIdFrontResult.filename,
				mimeType: nationalIdFrontResult.mimeType,
				size: nationalIdFrontResult.size,
				uploadedAt: new Date(),
				originalName: nationalIdFrontResult.filename,
				hash: nationalIdFrontResult.hash,
			};

			// Upload national ID back
			const nationalIdBackFile = files.nationalIdBack[0];
			const nationalIdBackResult = await diskStorageService.uploadFile(nationalIdBackFile);
			const nationalIdBack: DiskDocument = {
				publicId: nationalIdBackResult.publicId,
				url: nationalIdBackResult.url,
				filename: nationalIdBackResult.filename,
				mimeType: nationalIdBackResult.mimeType,
				size: nationalIdBackResult.size,
				uploadedAt: new Date(),
				originalName: nationalIdBackResult.filename,
				hash: nationalIdBackResult.hash,
			};

			// Upload qualification documents
			const qualificationFiles = files.qualifications || [];
			const qualifications: QualificationDocument[] = [];

			// Parse qualification metadata from request body
			// Expected format: qualificationsMeta = [{ type, title, description }, ...]
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
					'Invalid qualificationsMeta format. Must be valid JSON array.'
				);
			}

			// Validate qualifications metadata count matches files
			if (qualificationsMeta.length !== qualificationFiles.length) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Qualifications metadata count must match uploaded files count'
				);
			}

			for (let i = 0; i < qualificationFiles.length; i++) {
				const file = qualificationFiles[i];
				const meta = qualificationsMeta[i];

				// Validate each qualification metadata
				const metaValidation = QualificationSchema.safeParse(meta);
				if (!metaValidation.success) {
					return sendNormalized(
						res,
						StatusCodes.BAD_REQUEST,
						null,
						`Qualification ${i + 1}: ${metaValidation.error.issues[0].message}`
					);
				}

				const uploadResult = await diskStorageService.uploadFile(file);
				const qualificationDoc: QualificationDocument = {
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

				qualifications.push(qualificationDoc);
			}

			// Create nurse record
			const nurse = await db.nurses.create({
				firstName,
				lastName,
				phone,
				email,
				profilePicture,
				nationalId: {
					front: nationalIdFront,
					back: nationalIdBack,
				},
				qualifications,
				isActive: false, // Not active until verified by admin
				isVerified: false,
				documentVerificationStatus: 'pending',
			});

			return sendNormalized(
				res,
				StatusCodes.CREATED,
				{
					nurse: {
						id: nurse.id,
						firstName: nurse.firstName,
						lastName: nurse.lastName,
						phone: nurse.phone,
						email: nurse.email,
						profilePicture: nurse.profilePicture,
						documentVerificationStatus: nurse.documentVerificationStatus,
						isActive: nurse.isActive,
						isVerified: nurse.isVerified,
					},
				},
				'Nurse registration successful. Your documents are under review. Please wait for verification.'
			);
		} catch (error) {
			console.error('Error in nurse registration:', error);
			return next(error);
		}
	}
);

/**
 * POST /nurse-auth/signin
 * Initiate nurse signin with phone number (sends OTP)
 */
router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = NursePhoneAuthSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone } = result.data;

		// Check if nurse exists
		const nurse = await db.nurses.findOne({ phone });

		if (!nurse) {
			return sendNormalized(
				res,
				StatusCodes.NOT_FOUND,
				null,
				'No nurse account found with this phone number. Please register first.'
			);
		}

		// Check if nurse is verified
		if (!nurse.isVerified) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				{
					documentVerificationStatus: nurse.documentVerificationStatus,
				},
				'Your account is pending verification. Please wait for admin approval.'
			);
		}

		// Check if nurse is active
		if (!nurse.isActive) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Your account has been deactivated. Please contact support.'
			);
		}

		// Send OTP
		const otpResult = await messagingService.sendOTPViaSMS(phone);

		if (!otpResult.success) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				message: 'OTP sent to your phone number',
				expiresAt: otpResult.expiresAt,
				user: {
					...nurse,
				},
			},
			'Check your phone for OTP'
		);
	} catch (error) {
		console.error('Error in nurse signin:', error);
		return next(error);
	}
});

/**
 * POST /nurse-auth/verify-otp
 * Verify OTP and sign in nurse
 */
router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = NurseOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone, otp } = result.data;

		// Verify OTP
		const isValidOTP = await messagingService.verifyOTP(phone, otp);

		if (!isValidOTP) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		// Find nurse
		const nurse = await db.nurses.findOne({ phone });

		if (!nurse) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse account not found');
		}

		// Additional verification checks
		if (!nurse.isVerified) {
			await messagingService.expireOTP(phone);
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Your account is pending verification'
			);
		}

		if (!nurse.isActive) {
			await messagingService.expireOTP(phone);
			return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Your account is deactivated');
		}

		// Expire OTP after successful verification
		await messagingService.expireOTP(phone);

		// Generate access token
		const accessToken = createAccessToken(nurse as unknown as mongoose.Document & ACCOUNT);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				user: {
					phone: nurse.phone,
					firstName: nurse.firstName,
					lastName: nurse.lastName,
					email: nurse.email,
					isActive: nurse.isActive,
					isVerified: nurse.isVerified,
					profilePicture: nurse.profilePicture,
					nationalId: nurse.nationalId,
					qualifications: nurse.qualifications,
					documentVerificationStatus: nurse.documentVerificationStatus,
					markedForDeletion: nurse.markedForDeletion,
					deletionConfirmed: nurse.deletionConfirmed,
					createdAt: nurse.get('createdAt')?.toISOString?.() ?? null,
					updatedAt: nurse.get('updatedAt')?.toISOString?.() ?? null,
					id: nurse.id,
				},
				accessToken,
			},
			'Signed in successfully'
		);
	} catch (error) {
		console.error('Error in nurse OTP verification:', error);
		return next(error);
	}
});

/**
 * POST /nurse-auth/resend-otp
 * Resend OTP for nurse signin
 */
router.post('/resend-otp', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = NursePhoneAuthSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone } = result.data;

		const nurse = await db.nurses.findOne({ phone });

		if (!nurse) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Nurse account not found');
		}

		if (!nurse.isVerified || !nurse.isActive) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Account must be verified and active to receive OTP'
			);
		}

		// Send OTP
		const otpResult = await messagingService.sendOTPViaSMS(phone);

		if (!otpResult.success) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				expiresAt: otpResult.expiresAt,
			},
			'OTP resent successfully'
		);
	} catch (error) {
		console.error('Error in resend OTP:', error);
		return next(error);
	}
});

/**
 * GET /nurse-auth/registration-status/:phone
 * Check nurse registration status
 */
router.get(
	'/registration-status/:phone',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { phone } = req.params;

			const nurse = await db.nurses.findOne({ phone });

			if (!nurse) {
				return sendNormalized(
					res,
					StatusCodes.NOT_FOUND,
					{ registered: false },
					'No nurse account found with this phone number'
				);
			}

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					registered: true,
					nurse: {
						id: nurse.id,
						firstName: nurse.firstName,
						lastName: nurse.lastName,
						phone: nurse.phone,
						email: nurse.email,
						documentVerificationStatus: nurse.documentVerificationStatus,
						isVerified: nurse.isVerified,
						isActive: nurse.isActive,
					},
				},
				'Registration status retrieved successfully'
			);
		} catch (error) {
			console.error('Error checking registration status:', error);
			return next(error);
		}
	}
);

export default router;
