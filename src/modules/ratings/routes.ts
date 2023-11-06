import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { addRating, getAllRatings, getRating } from '@/modules/ratings/controller'
import authenticate from '@/middlewares/authentication'

const router = Router()

router.get('/', authenticate, makeCallback(getAllRatings()))
router.get('/:id', authenticate, makeCallback(getRating()))
router.post('/', authenticate, makeCallback(addRating()))

export { router as ratingsRouter }
