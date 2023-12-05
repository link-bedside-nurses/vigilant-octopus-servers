import callback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import { getCurrentUser } from '@/modules/me/controller'
import isBanned from '@/middlewares/is-banned'
const router = Router()

router.get( '/', authenticate, isBanned, callback( getCurrentUser() ) )

export default router
