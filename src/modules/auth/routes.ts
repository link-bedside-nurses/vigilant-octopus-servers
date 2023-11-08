import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import {
	adminSignin,
	adminSignup,
	caregiverSignin,
	caregiverSignup,
	getAccessToken,
	passwordReset,
	patientSignin,
	patientSignup,
} from '@/modules/auth/controller'
import authenticate from '@/middlewares/authentication'
import verifyRefreshTokenMiddleware from '@/middlewares/verify-refresh-token'

const router = Router()

router.post('/caregiver/signup', makeCallback(caregiverSignup()))
router.post('/patient/signup', makeCallback(patientSignup()))
router.post('/admin/signup', makeCallback(adminSignup()))

router.post('/caregiver/signin', makeCallback(caregiverSignin()))
router.post('/patient/signin', makeCallback(patientSignin()))
router.post('/admin/signin', makeCallback(adminSignin()))

router.post('/reset-password/:id', makeCallback(passwordReset()))
router.get('/token/refresh', authenticate, verifyRefreshTokenMiddleware, makeCallback(getAccessToken()))

export { router as authRouter }
