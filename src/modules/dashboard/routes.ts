import callback from '../../adapters/express-callback'
import { Router } from 'express'

import { getOverview } from './controller'

const router = Router()

router.get( '/', callback( getOverview() ) )

export { router as dashboardRouter }
