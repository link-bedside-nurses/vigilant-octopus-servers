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

router.get( '/', authenticate, isBanned, callback( getAllAppointments() ) );
router.post( '/', authenticate, isBanned, callback( scheduleAppointment() ) );
router.get( '/:id', authenticate, validateObjectID, isBanned, callback( getAppointment() ) );
router.get( '/history', authenticate, isBanned, callback( getAppointmentsHistory() ) );
router.patch( '/:id/update', authenticate, validateObjectID, isBanned, callback( updateAppointmentStatus() ) );
router.patch( '/:id/reschedule', authenticate, validateObjectID, isBanned, callback( rescheduleAppointment() ) );
router.patch(
	'/:id/confirm',
	authenticate,
	validateObjectID,
	isBanned,
	callback( confirmAppointment() )
);
router.patch(
	'/:id/cancel',
	authenticate,
	validateObjectID,
	isBanned,
	callback( cancelAppointment() )
);
router.delete(
	'/:id',
	authenticate,
	isAdmin,
	validateObjectID,
	isBanned,
	callback( deleteAppointment() )
);

export default router;
