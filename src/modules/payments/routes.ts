import callback from '../../express-callback';
import { Router } from 'express';

import authenticate from '../../security/authentication';
import { getAllPayments, getPayment, initiatePaymentFromPatient, checkPaymentStatus, getCaregiverEarnings, getPaymentsByPatient } from './controller';
import isBanned from '../../security/is-banned';

const router = Router();

// Payment management routes
router.get( '/', authenticate, isBanned, callback( getAllPayments() ) );
router.get( '/:id', authenticate, isBanned, callback( getPayment() ) );

// MOMO payment routes
router.post( '/patient/:id/initiate', authenticate, isBanned, callback( initiatePaymentFromPatient() ) );
router.get( '/:id/status', authenticate, isBanned, callback( checkPaymentStatus() ) );

router.get( '/caregivers/:id/earnings', authenticate, isBanned, callback( getCaregiverEarnings() ) );
router.get( '/patients/:id/payments', authenticate, isBanned, callback( getPaymentsByPatient() ) );

export default router;
