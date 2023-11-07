import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import { getCurrentUser } from '@/modules/me/controller'
const router = Router()

router.get('/', authenticate, makeCallback(getCurrentUser()))

export { router as meRouter }
