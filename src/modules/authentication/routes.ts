import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { signin, signup } from '@/modules/authentication/controller'

const router = Router()

router.post('/signup', makeCallback(signup()))
router.post('/signin', makeCallback(signin()))

export { router as authRouter }
