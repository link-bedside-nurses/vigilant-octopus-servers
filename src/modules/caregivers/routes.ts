import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { deleteCaregiver, getAllCaregivers, getCaregiver, updateCaregiver } from '@/modules/caregivers/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'
const router = Router()

router.get('/', authenticate, isBanned, makeCallback(getAllCaregivers()))
router.get('/:id', authenticate, isBanned, makeCallback(getCaregiver()))
router.patch('/:id', authenticate, isBanned, makeCallback(updateCaregiver()))
router.delete('/:id', authenticate, isBanned, makeCallback(deleteCaregiver()))

export { router as caregiverRouter }
