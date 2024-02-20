import callback from '../../adapters/express-callback'
import { Router } from 'express'

import { error, ping } from '../../modules/test/controller'

const router = Router()

router.get( '/ping', callback( ping() ) )
router.get( '/error', callback( error() ) )

export default router
