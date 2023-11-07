import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { error, ping } from '@/modules/test/controller'

const router = Router()

router.get('/ping', makeCallback(ping()))
router.get('/error', makeCallback(error()))

export { router as testRouter }
