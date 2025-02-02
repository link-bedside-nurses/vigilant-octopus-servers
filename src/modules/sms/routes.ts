import callback from '../../api/adapters/express-callback';
import { Router } from 'express';
import { verifyOTPFromPhone } from './verify-otp-from-phone';
import { getPhoneVerificationOTP } from './get-phone-verification-otp';

export const otpRouter = Router();

otpRouter.post( '/verify', callback( verifyOTPFromPhone() ) );
otpRouter.post( '/request', callback( getPhoneVerificationOTP() ) );
