import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { deletePatient, getAllPatients, getPatient, updatePatient } from '@/modules/patients/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isBanned, makeCallback(getAllPatients()))
router.get('/:id', authenticate, isBanned, makeCallback(getPatient()))
router.patch('/:id', authenticate, isBanned, makeCallback(updatePatient()))
router.delete('/:id', authenticate, isBanned, makeCallback(deletePatient()))

export { router as patientRouter }
