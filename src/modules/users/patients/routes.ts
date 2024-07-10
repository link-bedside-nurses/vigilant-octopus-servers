import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import {
	deactivatePatient,
	deletePatient,
	getAllPatients,
	getPatient,
	getPatientAppointments,
	updatePatient,
} from './patient.controller';
import authenticate from '../../../infrastructure/security/authentication/authentication';
import isBanned from '../../../infrastructure/security/authorization/is-banned';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllPatients()));
router.get('/:id', authenticate, isBanned, callback(getPatient()));
router.get('/:id/appointments', authenticate, isBanned, callback(getPatientAppointments()));
router.patch('/:id', authenticate, isBanned, callback(updatePatient()));
router.patch('/deactivate/:id', authenticate, isBanned, callback(deactivatePatient()));
router.delete('/:id', authenticate, isBanned, callback(deletePatient()));

export default router;
