import callback from '../../../adapters/express-callback';
import { Router } from 'express';

import {
	deactivatePatient,
	deletePatient,
	getAllPatients,
	getPatient,
	getPatientAppointments,
	updatePatient,
} from './controller';
import authenticate from '../../../middlewares/auth/authentication';
import isBanned from '../../../middlewares/auth/is-banned';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllPatients()));
router.get('/:id', authenticate, isBanned, callback(getPatient()));
router.get('/:id/appointments', authenticate, isBanned, callback(getPatientAppointments()));
router.patch('/:id', authenticate, isBanned, callback(updatePatient()));
router.patch('/deactivate/:id', authenticate, isBanned, callback(deactivatePatient()));
router.delete('/:id', authenticate, isBanned, callback(deletePatient()));

export default router;
