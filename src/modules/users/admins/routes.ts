import callback from '../../../adapters/express-callback';
import { Router } from 'express';
import authenticate from '../../../middlewares/auth/authentication';
import {
	getAllAdmins,
	getAdmin,
	updateAdmin,
	banAdmin,
	banCaregiver,
	banPatient,
	verifyPatient,
	verifyCaregiver,
} from './controller';
import isAdmin from '../../../middlewares/auth/is-admin';
import isBanned from '../../../middlewares/auth/is-banned';
import { getCaregiverAppointments } from '../../appointments/controller';

const router = Router();

router.get('/', authenticate, isAdmin, isBanned, callback(getAllAdmins()));
router.get('/:id', authenticate, isAdmin, isBanned, callback(getAdmin()));
router.get(
	'/appointments/:id/caregivers',
	authenticate,
	isAdmin,
	isBanned,
	callback(getCaregiverAppointments())
);
router.patch('/:id', authenticate, isAdmin, isBanned, callback(updateAdmin()));
router.patch('/:id/ban', authenticate, isAdmin, isBanned, callback(banAdmin()));
router.patch('/caregiver/:id/ban', authenticate, isAdmin, isBanned, callback(banCaregiver()));
router.patch('/patient/:id/ban', authenticate, isAdmin, isBanned, callback(banPatient()));
router.patch('/caregiver/:id/verify', authenticate, isAdmin, isBanned, callback(verifyCaregiver()));
router.patch('/patient/:id/verify', authenticate, isAdmin, isBanned, callback(verifyPatient()));

export default router;
