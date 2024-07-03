import callback from '../../../adapters/express-callback';
import { Router } from 'express';

import { completeCaregiverProfile } from './controller';
import authenticate from '../../../middlewares/auth/authentication';
import isBanned from '../../../middlewares/auth/is-banned';

const router = Router();

router.post('/caregivers', authenticate, isBanned, callback(completeCaregiverProfile()));

export default router;
