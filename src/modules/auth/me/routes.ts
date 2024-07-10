import { Router } from 'express';
import authenticate from '../../../infrastructure/security/authentication/authentication';
import isBanned from '../../../infrastructure/security/authorization/is-banned';
import { getCurrentUser } from './controller';
import callback from '../../../api/adapters/express-callback';

const router = Router();

router.get('/', authenticate, isBanned, callback(getCurrentUser()));

export default router;
