import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import { completeCaregiverProfile } from './controller';
import authenticate from '../../../infrastructure/security/authentication/authentication';
import isBanned from '../../../infrastructure/security/authorization/is-banned';

const router = Router();

router.post('/caregivers', authenticate, isBanned, callback(completeCaregiverProfile()));

export default router;
