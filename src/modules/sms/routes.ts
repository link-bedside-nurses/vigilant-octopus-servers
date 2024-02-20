import callback from '../../adapters/express-callback'
import { Router } from 'express'

import { getOTP, verifyOTP } from '../../modules/sms/controller'

const router = Router()

router.get( '/', callback( getOTP() ) )
router.post( '/verify', callback( verifyOTP() ) )

export { router as otpRouter }
