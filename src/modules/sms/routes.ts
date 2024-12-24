import callback from '../../api/adapters/express-callback';
import { Router } from 'express';
import { verifyOTPFromPhone } from './verify-otp-from-phone';

export const otpRouter = Router();

otpRouter.post( '/verify', callback( verifyOTPFromPhone() ) );
