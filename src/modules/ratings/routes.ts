import callback from '@/adapters/express-callback'
import { Router } from 'express'

import { addRating, deleteRating, getAllRatings, getRatings, getRating } from '@/modules/ratings/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get( '/', authenticate, isBanned, callback( getAllRatings() ) )
router.get( '/:id', authenticate, isBanned, callback( getRating() ) )
router.get( '/caregiver/:id', authenticate, isBanned, callback( getRatings() ) )
router.post( '/:id', authenticate, isBanned, callback( addRating() ) )
router.delete( '/:id', authenticate, isBanned, callback( deleteRating() ) )

export default router
