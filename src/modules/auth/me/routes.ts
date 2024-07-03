import { Router } from 'express';
import authenticate from '../../../middlewares/auth/authentication';
import isBanned from '../../../middlewares/auth/is-banned';
import { getCurrentUser } from './controller';
import callback from '../../../adapters/express-callback';

const router = Router();

router.get('/', authenticate, isBanned, callback(getCurrentUser()));

export default router;
