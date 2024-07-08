import callback from '../../adapters/express-callback';
import { Router } from 'express';

import {
	cancelAppointment,
	confirmAppointment,
	getAppointment,
	getAllAppointments,
	deleteAppointment,
	scheduleAppointment,
} from '../../modules/appointments/controller';
import authenticate from '../../middlewares/auth/authentication';
import { validateObjectID } from '../../middlewares/validate-objectid';
import isBanned from '../../middlewares/auth/is-banned';
import isAdmin from '../../middlewares/auth/is-admin';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllAppointments()));
router.post('/', authenticate, isBanned, callback(scheduleAppointment()));
router.get('/:id', authenticate, validateObjectID, isBanned, callback(getAppointment()));
router.patch(
	'/:id/confirm',
	authenticate,
	validateObjectID,
	isBanned,
	callback(confirmAppointment())
);
router.patch(
	'/:id/cancel',
	authenticate,
	validateObjectID,
	isBanned,
	callback(cancelAppointment())
);
router.delete(
	'/:id',
	authenticate,
	isAdmin,
	validateObjectID,
	isBanned,
	callback(deleteAppointment())
);

export default router;
