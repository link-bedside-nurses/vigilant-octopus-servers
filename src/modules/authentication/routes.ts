import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import {
	adminSignin,
	adminSignup,
	caregiverSignin,
	caregiverSignup,
	passwordReset,
	patientSignin,
	patientSignup,
} from '@/modules/authentication/controller'

const router = Router()

router.post('/caregiver/signup', makeCallback(caregiverSignup()))
router.post('/patient/signup', makeCallback(patientSignup()))
router.post('/admin/signup', makeCallback(adminSignup()))

router.post('/caregiver/signin', makeCallback(caregiverSignin()))
router.post('/patient/signin', makeCallback(patientSignin()))
router.post('/admin/signin', makeCallback(adminSignin()))

router.post('/reset-password/:id', makeCallback(passwordReset()))

export { router as authRouter }
