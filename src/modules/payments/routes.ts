import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import authenticate from '../../infra/security/authentication/authentication';
import { getAllPayments, getPayment, initiatePaymentFromPatient, checkPaymentStatus } from './controller';
import isBanned from '../../infra/security/authorization/is-banned';

const router = Router();

// Payment management routes
router.get( '/', authenticate, isBanned, callback( getAllPayments() ) );
router.get( '/:id', authenticate, isBanned, callback( getPayment() ) );

// MOMO payment routes
router.post( '/patient/:id/initiate', authenticate, isBanned, callback( initiatePaymentFromPatient() ) );
router.get( '/:id/status', authenticate, isBanned, callback( checkPaymentStatus() ) );

export default router;
