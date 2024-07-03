import callback from '../../adapters/express-callback';
import { Router } from 'express';

import { deleteAccount, getAccessToken } from '../../modules/auth/controller';
import verifyRefreshTokenMiddleware from '../../middlewares/auth/verify-refresh-token';
import { adminSignup } from './signup/admin';
import { caregiverSignup } from './signup/caregiver';
import { patientSignup } from './signup/patient';
import { adminSignin } from './signin/admin';
import { caregiverSignin } from './signin/caregiver';
import { patientSignin } from './signin/patient';

const router = Router();

router.post('/caregiver/signup', callback(caregiverSignup()));
router.post('/caregiver/signin', callback(caregiverSignin()));

router.post('/patient/signup', callback(patientSignup()));
router.post('/patient/signin', callback(patientSignin()));

router.post('/admin/signin', callback(adminSignin()));
router.post('/admin/signup', callback(adminSignup()));

router.delete('/accounts/deletion', callback(deleteAccount()));

router.get('/token/refresh', verifyRefreshTokenMiddleware, callback(getAccessToken()));

export default router;
