import callback from '../../../adapters/express-callback';
import { Router } from 'express';

import {
	deleteCaregiver,
	getAllCaregivers,
	getCaregiver,
	getCaregiverAppointments,
	searchCaregiversByLocation,
	updateCaregiver,
} from './controller';
import authenticate from '../../../middlewares/auth/authentication';
import isBanned from '../../../middlewares/auth/is-banned';
const router = Router();

router.get('/', isBanned, callback(getAllCaregivers()));
router.get('/search', authenticate, isBanned, callback(searchCaregiversByLocation()));
router.get('/:id', authenticate, isBanned, callback(getCaregiver()));
router.get('/:id/appointments', authenticate, isBanned, callback(getCaregiverAppointments()));
router.patch('/:id', authenticate, isBanned, callback(updateCaregiver()));
router.delete('/:id', authenticate, isBanned, callback(deleteCaregiver()));

export default router;
