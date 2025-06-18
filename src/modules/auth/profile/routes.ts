import callback from '../../../express-callback';
import { Router } from 'express';

import { completeNurseProfile } from './controller';
import authenticate from '../../../security/authentication';

const router = Router();

router.post( '/nurses', authenticate, callback( completeNurseProfile() ) );

export default router;
