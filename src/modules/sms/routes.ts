import callback from '../../api/adapters/express-callback';
import { Router } from 'express';
import { getPhoneVerificationOTP } from './get-phone-verification-otp';
import { verifyOTPFromPhone } from './verify-otp-from-phone';

const router = Router();

router.get( '/', callback( getPhoneVerificationOTP() ) );
router.post( '/verify', callback( verifyOTPFromPhone() ) );

export { router as otpRouter };
