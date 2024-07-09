import callback from '../../adapters/express-callback';
import { Router } from 'express';

import { getPhoneVericationOTP, verifyOTPFromPhone } from './controller';

const router = Router();

router.get('/', callback(getPhoneVericationOTP()));
router.post('/verify', callback(verifyOTPFromPhone()));

export { router as otpRouter };
