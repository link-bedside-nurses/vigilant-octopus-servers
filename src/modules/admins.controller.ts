import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { response } from '../utils/http-response';

const router = Router();
// router.use(authenticate);

// GET /admins - get all admins
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admins = await db.admins.find({}).sort({ createdAt: 'desc' });
		return res.send(response(StatusCodes.OK, admins, 'Admins Retrieved'));
	} catch (err) {
		return next(err);
	}
});

// GET /admins/:id - get admin by id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admin = await db.admins.findById(req.params.id);
		if (!admin) return res.send(response(StatusCodes.NOT_FOUND, null, 'No admin Found'));
		return res.send(response(StatusCodes.OK, admin, 'Admin Retrieved'));
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/:id - update admin
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admin = await db.admins.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
		if (!admin) return res.send(response(StatusCodes.NOT_FOUND, null, 'No admin Found'));
		return res.send(response(StatusCodes.OK, admin, 'Admin updated'));
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/:id/ban - ban admin
router.patch('/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.account?.id === req.params.id) {
			return res.send(
				response(
					StatusCodes.BAD_REQUEST,
					null,
					'You cannot ban yourself, Please select a different admin to ban'
				)
			);
		}
		const updatedAdmin = await db.admins.findByIdAndUpdate(
			req.params.id,
			{ $set: { isBanned: true } },
			{ new: true }
		);
		if (!updatedAdmin) return res.send(response(StatusCodes.NOT_FOUND, null, 'No admin Found'));
		return res.send(response(StatusCodes.OK, updatedAdmin, 'Admin banned'));
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/nurse/:id/ban - ban nurse
router.patch('/nurse/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const bannedNurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ isBanned: true },
			{ new: true }
		);
		if (!bannedNurse) return res.send(response(StatusCodes.NOT_FOUND, null, 'No such nurse Found'));
		return res.send(
			response(StatusCodes.OK, bannedNurse, 'Nurse Successfully banned from using the application')
		);
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/nurse/:id/verify - verify nurse
router.patch('/nurse/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const verifiedNurse = await db.nurses.findByIdAndUpdate(
			req.params.id,
			{ isVerified: true, isActive: true },
			{ new: true }
		);
		if (!verifiedNurse)
			return res.send(response(StatusCodes.NOT_FOUND, null, 'No such nurse Found'));
		return res.send(response(StatusCodes.OK, verifiedNurse, 'Nurse verified'));
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/patient/:id/ban - ban patient
router.patch('/patient/:id/ban', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const bannedPatient = await db.patients.findByIdAndUpdate(
			req.params.id,
			{ isBanned: true },
			{ new: true }
		);
		if (!bannedPatient)
			return res.send(response(StatusCodes.NOT_FOUND, null, 'No such patient Found'));
		return res.send(
			response(
				StatusCodes.OK,
				bannedPatient,
				'Patient Successfully banned from using the application!'
			)
		);
	} catch (err) {
		return next(err);
	}
});

// PATCH /admins/patient/:id/verify - verify patient
router.patch('/patient/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const verifiedPatient = await db.patients.findByIdAndUpdate(
			req.params.id,
			{ isVerified: true },
			{ new: true }
		);
		if (!verifiedPatient)
			return res.send(response(StatusCodes.NOT_FOUND, null, 'No such patient Found'));
		return res.send(response(StatusCodes.OK, verifiedPatient, 'Patient verified!'));
	} catch (err) {
		return next(err);
	}
});

export default router;
