import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { normalizedResponse } from '../utils/http-response';

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	// Check file type
	const allowedMimeTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
	}
};

// Create multer instance
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 15 * 1024 * 1024, // 15MB limit
		files: 10, // Maximum 10 files
	},
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
	return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
	return upload.array(fieldName, maxCount);
};

// Multiple fields upload middleware
export const uploadFields = (fields: multer.Field[]) => {
	return upload.fields(fields);
};

// Specific upload middlewares for different document types
export const uploadProfilePicture = uploadSingle('profilePicture');

export const uploadNationalID = uploadFields([
	{ name: 'front', maxCount: 1 },
	{ name: 'back', maxCount: 1 },
]);

export const uploadQualification = uploadSingle('document');

// Error handling middleware for multer errors
export const handleUploadError = (error: any, _req: Request, res: Response, next: NextFunction) => {
	if (error instanceof multer.MulterError) {
		switch (error.code) {
			case 'LIMIT_FILE_SIZE':
				return res.send(
					normalizedResponse(StatusCodes.BAD_REQUEST, null, 'File too large. Maximum size is 15MB')
				);
			case 'LIMIT_FILE_COUNT':
				return res.send(
					normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Too many files. Maximum is 10 files')
				);
			case 'LIMIT_UNEXPECTED_FILE':
				return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Unexpected file field'));
			default:
				return res.send(
					normalizedResponse(StatusCodes.BAD_REQUEST, null, `Upload error: ${error.message}`)
				);
		}
	}

	if (error.message && error.message.includes('File type not allowed')) {
		return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, error.message));
	}

	return next(error);
};

// Validation middleware for file uploads
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
	const file = req.file;
	const files = req.files;

	if (!file && !files) {
		return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'No files uploaded'));
	}

	return next();
};

// Validation middleware for specific file types
export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
	const file = req.file;

	if (!file) {
		return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'No image uploaded'));
	}

	const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
	if (!allowedImageTypes.includes(file.mimetype)) {
		return res.send(
			normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Only image files are allowed')
		);
	}

	return next();
};

export const validateDocumentUpload = (req: Request, res: Response, next: NextFunction) => {
	const file = req.file;

	if (!file) {
		return res.send(normalizedResponse(StatusCodes.BAD_REQUEST, null, 'No document uploaded'));
	}

	const allowedDocTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];

	if (!allowedDocTypes.includes(file.mimetype)) {
		return res.send(
			normalizedResponse(
				StatusCodes.BAD_REQUEST,
				null,
				'Only PDF, Word documents, and images are allowed'
			)
		);
	}

	return next();
};
