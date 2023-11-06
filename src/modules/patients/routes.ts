import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import { deletePatient, getAllPatients, getPatient, updatePatient } from '@/modules/patients/controller'
import authenticate from '@/middlewares/authentication'

const router = Router()

router.get('/', authenticate, makeCallback(getAllPatients()))
router.get('/:id', authenticate, makeCallback(getPatient()))
router.patch('/:id', authenticate, makeCallback(updatePatient()))
router.delete('/:id', authenticate, makeCallback(deletePatient()))

export { router as patientRouter }
