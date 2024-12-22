import callback from '../../api/adapters/express-callback';
import { Router } from 'express';
import { verifyOTPFromPhone } from './verify-otp-from-phone';

const router = Router();

router.post( '/verify', callback( verifyOTPFromPhone() ) );

export { router as otpRouter };
