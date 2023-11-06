import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { deleteCaregiver, getAllCaregivers, getCaregiver, updateCaregiver } from '@/modules/caregivers/controller'
import authenticate from '@/middlewares/authentication'
const router = Router()

router.get('/', authenticate, makeCallback(getAllCaregivers()))
router.get('/:id', authenticate, makeCallback(getCaregiver()))
router.patch('/:id', authenticate, makeCallback(updateCaregiver()))
router.delete('/:id', authenticate, makeCallback(deleteCaregiver()))

export { router as caregiverRouter }
