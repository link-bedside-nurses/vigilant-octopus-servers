import callback from '../../adapters/express-callback'
import { Router } from 'express'

import authenticate from '../../middlewares/authentication'
import { makeMomoPayement, getAllPayments, getPayment } from '../../modules/payments/controller'
import isBanned from '../../middlewares/is-banned'

const router = Router()

router.get( '/', authenticate, isBanned, callback( getAllPayments() ) )
router.get( '/:id', authenticate, isBanned, callback( getPayment() ) )
router.delete( '/:id', authenticate, isBanned, callback( makeMomoPayement() ) )

export default router
