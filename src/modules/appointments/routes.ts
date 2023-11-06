import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import {
	cancelAppointment,
	confirmAppointment,
	getAppointment,
	getAllAppointments,
	getPatientAppointments,
	getCaregiverAppointments,
	deleteAppointment,
} from '@/modules/appointments/controller'
import authenticate from '@/middlewares/authentication'
import { validateObjectID } from '@/middlewares/validate-objectid'

const router = Router()

router.get('/', authenticate, makeCallback(getAllAppointments()))
router.get('/:id', authenticate, validateObjectID, makeCallback(getAppointment()))
router.get('/patients/:id', authenticate, validateObjectID, makeCallback(getPatientAppointments()))
router.get('/caregivers/:id', authenticate, validateObjectID, makeCallback(getCaregiverAppointments()))

router.patch('/confirm/:id', authenticate, validateObjectID, makeCallback(confirmAppointment()))
router.patch('/cancel/:id', authenticate, validateObjectID, makeCallback(cancelAppointment()))
router.delete('/:id', authenticate, validateObjectID, makeCallback(deleteAppointment()))

export { router as appointmentRouter }
