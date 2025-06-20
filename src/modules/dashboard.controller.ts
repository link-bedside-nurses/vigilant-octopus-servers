import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { normalizedResponse } from '../utils/http-response';

const router = Router();

// GET /dashboard/ - get overview stats
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const admins = await db.admins.find({});
		const nurses = await db.nurses.find({});
		const patients = await db.patients.find({});
		const appointments = await db.appointments.find({});
		const payments = await db.payments.find({});

		const overviewData = {
			admins: admins.length,
			nurses: nurses.length,
			patients: patients.length,
			appointments: appointments.length,
			payments: payments.length,
		};
		return res.send(
			normalizedResponse(StatusCodes.OK, overviewData, 'Successfully returned stats overview')
		);
	} catch (err) {
		return next(err);
	}
});

export default router;
