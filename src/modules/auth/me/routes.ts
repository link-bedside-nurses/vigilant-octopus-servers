import { Router } from 'express';
import authenticate from '../../../infra/security/authentication/authentication';
import isBanned from '../../../infra/security/authorization/is-banned';
import { getCurrentUser } from './controller';
import callback from '../../../api/adapters/express-callback';

const router = Router();

router.get('/', authenticate, isBanned, callback(getCurrentUser()));

export default router;
