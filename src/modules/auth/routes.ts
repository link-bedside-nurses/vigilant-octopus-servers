import callback from '../../adapters/express-callback'
import { Router } from 'express'

import {
	adminSignin,
	adminSignup,
	caregiverSignin,
	caregiverSignup,
	deleteAccount,
	getAccessToken,
	patientSignin,
	patientSignup,
} from '../../modules/auth/controller'
import verifyRefreshTokenMiddleware from '../../middlewares/verify-refresh-token'

const router = Router()

router.post( '/caregiver/signup', callback( caregiverSignup() ) )
router.post( '/caregiver/signin', callback( caregiverSignin() ) )

router.post( '/patient/signup', callback( patientSignup() ) )
router.post( '/patient/signin', callback( patientSignin() ) )

router.post( '/admin/signin', callback( adminSignin() ) )
router.post( '/admin/signup', callback( adminSignup() ) )

router.delete( '/accounts/deletion', callback( deleteAccount() ) )

// router.post( '/reset-password/:id', callback( passwordReset() ) )
router.get( '/token/refresh', verifyRefreshTokenMiddleware, callback( getAccessToken() ) )

export default router
