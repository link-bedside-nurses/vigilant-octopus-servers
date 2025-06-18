import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const qualificationStorage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'public/uploads/qualifications');
	},
	filename: (_req, file, cb) => {
		const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

const qualificationFileFilter = (
	_req: any,
	file: { mimetype: string },
	cb: (arg0: Error | null, arg1: boolean) => void
) => {
	const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
	}
};

export const uploadQualifications = multer({
	storage: qualificationStorage,
	// @ts-ignore
	fileFilter: qualificationFileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});
