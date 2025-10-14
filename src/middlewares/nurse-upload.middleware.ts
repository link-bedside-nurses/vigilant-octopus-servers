import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { sendNormalized } from '../utils/http-response';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function for nurse documents
const nurseFileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	// Allowed mime types for nurse documents
	const allowedMimeTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				`File type not allowed for ${file.fieldname}. Allowed types: images (JPG, PNG), PDF, Word documents`
			)
		);
	}
};

// Create multer instance for nurse uploads
const nurseUpload = multer({
	storage,
	fileFilter: nurseFileFilter,
	limits: {
		fileSize: 15 * 1024 * 1024, // 15MB per file
		files: 10, // Maximum 10 files total
	},
});

/**
 * Unified middleware for nurse document uploads
 * Handles: profilePicture, nationalIdFront, nationalIdBack, qualifications[]
 */
export const uploadNurseDocuments = nurseUpload.fields([
	{ name: 'profilePicture', maxCount: 1 },
	{ name: 'nationalIdFront', maxCount: 1 },
	{ name: 'nationalIdBack', maxCount: 1 },
	{ name: 'qualifications', maxCount: 5 }, // Up to 5 qualification documents
]);

/**
 * Validation middleware for nurse document uploads
 */
export const validateNurseDocuments = (req: Request, res: Response, next: NextFunction) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

	if (!files) {
		return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'No files uploaded');
	}

	// Validate profile picture
	if (!files.profilePicture || files.profilePicture.length === 0) {
		return sendNormalized(
			res,
			StatusCodes.BAD_REQUEST,
			null,
			'Profile picture is required'
		);
	}

	// Validate profile picture is an image
	const profilePic = files.profilePicture[0];
	if (!profilePic.mimetype.startsWith('image/')) {
		return sendNormalized(
			res,
			StatusCodes.BAD_REQUEST,
			null,
			'Profile picture must be an image file'
		);
	}

	// Validate national ID documents
	if (!files.nationalIdFront || files.nationalIdFront.length === 0) {
		return sendNormalized(
			res,
			StatusCodes.BAD_REQUEST,
			null,
			'National ID front is required'
		);
	}

	if (!files.nationalIdBack || files.nationalIdBack.length === 0) {
		return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'National ID back is required');
	}

	// Validate at least one qualification document
	if (!files.qualifications || files.qualifications.length === 0) {
		return sendNormalized(
			res,
			StatusCodes.BAD_REQUEST,
			null,
			'At least one qualification document is required'
		);
	}

	// Validate qualifications count
	if (files.qualifications.length > 5) {
		return sendNormalized(
			res,
			StatusCodes.BAD_REQUEST,
			null,
			'Maximum 5 qualification documents allowed'
		);
	}

	return next();
};

/**
 * Error handling middleware for multer errors in nurse uploads
 */
export const handleNurseUploadError = (
	error: any,
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	if (error instanceof multer.MulterError) {
		switch (error.code) {
			case 'LIMIT_FILE_SIZE':
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'File too large. Maximum size is 15MB per file'
				);
			case 'LIMIT_FILE_COUNT':
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Too many files. Maximum total is 10 files'
				);
			case 'LIMIT_UNEXPECTED_FILE':
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Unexpected file field. Use: profilePicture, nationalIdFront, nationalIdBack, qualifications'
				);
			default:
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					`Upload error: ${error.message}`
				);
		}
	}

	if (error.message && error.message.includes('File type not allowed')) {
		return sendNormalized(res, StatusCodes.BAD_REQUEST, null, error.message);
	}

	return next(error);
};

/**
 * Optional: Upload only profile picture (for updates)
 */
export const uploadProfilePictureOnly = nurseUpload.single('profilePicture');

/**
 * Optional: Upload qualification documents only (for adding later)
 */
export const uploadQualificationsOnly = nurseUpload.array('qualifications', 5);
