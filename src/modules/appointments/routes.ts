import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import {
	cancelAppointment,
	confirmAppointment,
	getAppointment,
	getAllAppointments,
	deleteAppointment,
	scheduleAppointment,
} from './appointment.controller';
import authenticate from '../../infrastructure/security/authentication/authentication';
import { validateObjectID } from '../../api/middlewares/validate-objectid';
import isBanned from '../../infrastructure/security/authorization/is-banned';
import isAdmin from '../../infrastructure/security/authorization/is-admin';

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
