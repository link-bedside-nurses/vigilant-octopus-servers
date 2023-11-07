import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { addRating, deleteRating, getAllRatings, getRating } from '@/modules/ratings/controller'
import authenticate from '@/middlewares/authentication'

const router = Router()

router.get('/', authenticate, makeCallback(getAllRatings()))
router.get('/:id', authenticate, makeCallback(getRating()))
router.post('/:id', authenticate, makeCallback(addRating()))
router.delete('/:id', authenticate, makeCallback(deleteRating()))

export { router as ratingsRouter }
