import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import {
	deleteCaregiver,
	getAllCaregivers,
	getCaregiver,
	getCaregiverAppointments,
	searchCaregiversByLocation,
	updateCaregiver,
} from './caregiver.controller';
import authenticate from '../../../infrastructure/security/authentication/authentication';
import isBanned from '../../../infrastructure/security/authorization/is-banned';
const router = Router();

router.get('/', isBanned, callback(getAllCaregivers()));
router.get('/search', authenticate, isBanned, callback(searchCaregiversByLocation()));
router.get('/:id', authenticate, isBanned, callback(getCaregiver()));
router.get('/:id/appointments', authenticate, isBanned, callback(getCaregiverAppointments()));
router.patch('/:id', authenticate, isBanned, callback(updateCaregiver()));
router.delete('/:id', authenticate, isBanned, callback(deleteCaregiver()));

export default router;
