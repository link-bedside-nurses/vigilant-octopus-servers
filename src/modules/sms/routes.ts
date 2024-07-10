import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import { getPhoneVerificationOTP, verifyOTPFromPhone } from '.';

const router = Router();

router.get('/', callback(getPhoneVerificationOTP()));
router.post('/verify', callback(verifyOTPFromPhone()));

export { router as otpRouter };
