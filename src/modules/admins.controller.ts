import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import authenticate from '../middlewares/authentication';
import { sendNormalized } from '../utils/http-response';

const router = Router();
router.use(authenticate);

// GET /admins - get all admins
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admins = await db.admins.find({}).sort({ createdAt: 'desc' });
		return sendNormalized(res, StatusCodes.OK, admins, 'Admins Retrieved');
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/nurse/:id/ban - ban nurse (must come before /:id routes)
router.patch('/nurse/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const bannedNurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ isBanned: true },
			{ new: true }
		);
		if (!bannedNurse)
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No such nurse Found');
		return sendNormalized(
			res,
			StatusCodes.OK,
			bannedNurse,
			'Nurse Successfully banned from using the application'
		);
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/nurse/:id/verify - verify nurse (must come before /:id routes)
router.patch('/nurse/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const verifiedNurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ isVerified: true, isActive: true },
			{ new: true }
		);
		if (!verifiedNurse)
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No such nurse Found');
		return sendNormalized(res, StatusCodes.OK, verifiedNurse, 'Nurse verified');
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/patient/:id/ban - ban patient (must come before /:id routes)
router.patch('/patient/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const bannedPatient = await db.patients.findByIdAndUpdate(
			req.params.id,
			{ isBanned: true },
			{ new: true }
		);
		if (!bannedPatient)
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No such patient Found');
		return sendNormalized(
			res,
			StatusCodes.OK,
			bannedPatient,
			'Patient Successfully banned from using the application!'
		);
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/patient/:id/verify - verify patient (must come before /:id routes)
router.patch('/patient/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const verifiedPatient = await db.patients.findByIdAndUpdate(
			req.params.id,
			{ isVerified: true },
			{ new: true }
		);
		if (!verifiedPatient)
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No such patient Found');
		return sendNormalized(res, StatusCodes.OK, verifiedPatient, 'Patient verified!');
	} catch (err) {
		return next(err);
	}
});

// GET /admins/:id - get admin by id (must come after specific routes)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admin = await db.admins.findById(req.params.id);
		if (!admin) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No admin Found');
		return sendNormalized(res, StatusCodes.OK, admin, 'Admin Retrieved');
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/:id - update admin
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admin = await db.admins.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
		if (!admin) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No admin Found');
		return sendNormalized(res, StatusCodes.OK, admin, 'Admin updated');
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/:id/ban - ban admin
router.patch('/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.account?.id === req.params.id) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'You cannot ban yourself, Please select a different admin to ban'
			);
		}
		const updatedAdmin = await db.admins.findByIdAndUpdate(
			req.params.id,
			{ $set: { isBanned: true } },
			{ new: true }
		);
		if (!updatedAdmin) return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'No admin Found');
		return sendNormalized(res, StatusCodes.OK, updatedAdmin, 'Admin banned');
	} catch (err) {
		return next(err);
	}
});

export default router;
