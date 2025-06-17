import callback from '../../../express-callback';
import { Router } from 'express';

import authenticate from '../../../security/authentication';
import isBanned from '../../../security/is-banned';
import { deactivatePatient } from './deactivate-patient';
import { deletePatient } from './delete-patient';
import { getAllPatients } from './get-all-patients';
import { getPatient } from './get-patient';
import { getPatientAppointments } from './get-patient-appointments';
import { updatePatient } from './update-patient';
import { configureMomoNumber } from './momo-number/configure-momo-number';
import { verifyMomoNumber } from './momo-number/verify-momo-number';

const router = Router();

router.get( '/', authenticate, isBanned, callback( getAllPatients() ) );
router.get( '/:id', authenticate, isBanned, callback( getPatient() ) );
router.get( '/:id/appointments', authenticate, isBanned, callback( getPatientAppointments() ) );
router.patch( '/:id', authenticate, isBanned, callback( updatePatient() ) );
router.patch( '/deactivate/:id', authenticate, isBanned, callback( deactivatePatient() ) );
router.delete( '/:id', authenticate, isBanned, callback( deletePatient() ) );

// Mobile money number routes
router.post( '/:id/momo-number', authenticate, isBanned, callback( configureMomoNumber() ) );
router.post( '/:id/momo-number/verify', authenticate, isBanned, callback( verifyMomoNumber() ) );

export default router;
