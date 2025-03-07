import callback from '../../api/adapters/express-callback';
import { Router } from 'express';
import authenticate from '../../infra/security/authentication/authentication';
import { validateObjectID } from '../../api/middlewares/validate-objectid';
import isBanned from '../../infra/security/authorization/is-banned';
import isAdmin from '../../infra/security/authorization/is-admin';
import { cancelAppointment } from './cancel-appointment';
import { confirmAppointment } from './confirm-appointment';
import { deleteAppointment } from './delete-appointment';
import { getAllAppointments } from './get-all-appointments';
import { getAppointment } from './get-appointment';
import { scheduleAppointment } from './schedule-appointment';
import { updateAppointmentStatus } from './update-appointment';
import rescheduleAppointment from './reschedule-appointment';
import { getAppointmentsHistory } from './get-appointments-history';

const router = Router();
router.use( authenticate, isBanned )
router.get( '/', callback( getAllAppointments() ) );
router.post( '/', callback( scheduleAppointment() ) );
router.get( '/:id', validateObjectID, callback( getAppointment() ) );
router.post( '/history', callback( getAppointmentsHistory() ) );
router.patch( '/:id/update', validateObjectID, isBanned, callback( updateAppointmentStatus() ) );
router.patch( '/:id/reschedule', validateObjectID, isBanned, callback( rescheduleAppointment() ) );
router.patch( '/:id/confirm', validateObjectID, callback( confirmAppointment() ) );
router.patch( '/:id/cancel', validateObjectID, callback( cancelAppointment() ) );
router.delete( '/:id', isAdmin, validateObjectID, callback( deleteAppointment() ) );

export default router;
