import callback from '../../adapters/express-callback';
import { Router } from 'express';

import { sendEmail, verifyEmail } from './controller';

const router = Router();

router.get('/', callback(sendEmail()));
router.post('/verify', callback(verifyEmail()));

export { router as emailRouter };
