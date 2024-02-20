import callback from '../../adapters/express-callback'
import { Router } from 'express'

import {
	cancelAppointment,
	confirmAppointment,
	getAppointment,
	getAllAppointments,
	getPatientAppointments,
	getCaregiverAppointments,
	deleteAppointment,
	scheduleAppointment,
} from '../../modules/appointments/controller'
import authenticate from '../../middlewares/authentication'
import { validateObjectID } from '../../middlewares/validate-objectid'
import isBanned from '../../middlewares/is-banned'

const router = Router()

router.get( '/', authenticate, isBanned, callback( getAllAppointments() ) )
router.post( '/', authenticate, isBanned, callback( scheduleAppointment() ) )
router.get( '/:id', authenticate, validateObjectID, isBanned, callback( getAppointment() ) )
router.get( '/patients/:id', authenticate, validateObjectID, isBanned, callback( getPatientAppointments() ) )
router.get( '/caregivers/:id', authenticate, validateObjectID, isBanned, callback( getCaregiverAppointments() ) )

router.patch( '/confirm/:id', authenticate, validateObjectID, isBanned, callback( confirmAppointment() ) )
router.patch( '/cancel/:id', authenticate, validateObjectID, isBanned, callback( cancelAppointment() ) )
router.delete( '/:id', authenticate, validateObjectID, isBanned, callback( deleteAppointment() ) )

export default router
