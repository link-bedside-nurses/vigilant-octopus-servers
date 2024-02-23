import callback from '../../adapters/express-callback'
import { Router } from 'express'

import {
	cancelAppointment,
	confirmAppointment,
	getAppointment,
	getAllAppointments,
	deleteAppointment,
	scheduleAppointment,
	getPatientAppointments,
	getCaregiverAppointments,
} from '../../modules/appointments/controller'
import authenticate from '../../middlewares/authentication'
import { validateObjectID } from '../../middlewares/validate-objectid'
import isBanned from '../../middlewares/is-banned'
import isAdmin from '../../middlewares/is-admin'

const router = Router()

router.get( '/', authenticate, isBanned, callback( getAllAppointments() ) )
router.post( '/', authenticate, isBanned, callback( scheduleAppointment() ) )
router.get( '/:id', authenticate, validateObjectID, isBanned, callback( getAppointment() ) )
router.get( '/:id/patients', authenticate, validateObjectID, isBanned, callback( getPatientAppointments() ) )
router.get( '/:id/caregivers', authenticate, validateObjectID, isBanned, callback( getCaregiverAppointments() ) )

router.patch( '/:id/confirm', authenticate, validateObjectID, isBanned, callback( confirmAppointment() ) )
router.patch( '/:id/cancel', authenticate, validateObjectID, isBanned, callback( cancelAppointment() ) )
router.delete( '/:id', authenticate, isAdmin, validateObjectID, isBanned, callback( deleteAppointment() ) )

export default router
