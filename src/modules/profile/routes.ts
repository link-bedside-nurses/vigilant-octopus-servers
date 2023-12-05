import callback from '@/adapters/express-callback'
import { Router } from 'express'

import { completeCaregiverProfile } from '@/modules/profile/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.post( '/caregivers', authenticate, isBanned, callback( completeCaregiverProfile() ) )

export default router
