import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import { getEmailVerificationOTP, sendEmail, verifyEmail } from './controller';

const router = Router();

router.get( '/', callback( sendEmail() ) );
router.post( '/verify', callback( verifyEmail() ) );
router.get( '/otp', callback( getEmailVerificationOTP() ) );

export { router as emailRouter };
