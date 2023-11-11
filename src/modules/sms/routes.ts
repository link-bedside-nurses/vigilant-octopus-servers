import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { getOTP, verifyOTP } from '@/modules/sms/controller'

const router = Router()

router.get('/', makeCallback(getOTP()))
router.post('/verify', makeCallback(verifyOTP()))

export { router as otpRouter }
