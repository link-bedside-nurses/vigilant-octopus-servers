import { Router } from 'express';
import authenticate from '../../../security/authentication';
import isBanned from '../../../security/is-banned';
import { getCurrentUser } from './controller';
import callback from '../../../express-callback';

const router = Router();

router.get( '/', authenticate, isBanned, callback( getCurrentUser() ) );

export default router;
