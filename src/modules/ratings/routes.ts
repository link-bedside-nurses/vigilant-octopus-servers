import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { addRating, deleteRating, getAllRatings, getCaregiverRatings, getRating } from '@/modules/ratings/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isBanned, makeCallback(getAllRatings()))
router.get('/:id', authenticate, isBanned, makeCallback(getRating()))
router.get('/caregiver/:id', authenticate, isBanned, makeCallback(getCaregiverRatings()))
router.post('/:id', authenticate, isBanned, makeCallback(addRating()))
router.delete('/:id', authenticate, isBanned, makeCallback(deleteRating()))

export { router as ratingsRouter }
