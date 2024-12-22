import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import authenticate from '../../../infra/security/authentication/authentication';
import isBanned from '../../../infra/security/authorization/is-banned';
import { deactivatePatient } from './deactivate-patient';
import { deletePatient } from './delete-patient';
import { getAllPatients } from './get-all-patients';
import { getPatient } from './get-patient';
import { getPatientAppointments } from './get-patient-appointments';
import { updatePatient } from './update-patient';

const router = Router();

router.get( '/', authenticate, isBanned, callback( getAllPatients() ) );
router.get( '/:id', authenticate, isBanned, callback( getPatient() ) );
router.get( '/:id/appointments', authenticate, isBanned, callback( getPatientAppointments() ) );
router.patch( '/:id', authenticate, isBanned, callback( updatePatient() ) );
router.patch( '/deactivate/:id', authenticate, isBanned, callback( deactivatePatient() ) );
router.delete( '/:id', authenticate, isBanned, callback( deletePatient() ) );

export default router;
