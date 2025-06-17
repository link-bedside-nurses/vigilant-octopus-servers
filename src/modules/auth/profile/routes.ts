import callback from '../../../express-callback';
import { Router } from 'express';

import { completeCaregiverProfile } from './controller';
import authenticate from '../../../security/authentication';
import isBanned from '../../../security/is-banned';

const router = Router();

router.post( '/caregivers', authenticate, isBanned, callback( completeCaregiverProfile() ) );

export default router;
