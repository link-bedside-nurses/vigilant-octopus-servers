import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import { completeCaregiverProfile } from './controller';
import authenticate from '../../../infra/security/authentication/authentication';
import isBanned from '../../../infra/security/authorization/is-banned';

const router = Router();

router.post('/caregivers', authenticate, isBanned, callback(completeCaregiverProfile()));

export default router;
