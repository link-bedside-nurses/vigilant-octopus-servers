import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import authenticate from '../../infrastructure/security/authentication/authentication';
import { getAllPayments, getPayment, makeMomoPayment } from '../../modules/payments/controller';
import isBanned from '../../infrastructure/security/authorization/is-banned';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllPayments()));
router.get('/:id', authenticate, isBanned, callback(getPayment()));
router.post('/:id', authenticate, isBanned, callback(makeMomoPayment()));

export default router;
