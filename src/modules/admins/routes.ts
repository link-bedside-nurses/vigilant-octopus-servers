import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import { getAllAdmins, getAdmin, updateAdmin, banAdmin, banCaregiver, banPatient } from '@/modules/admins/controller'
import isAdmin from '@/middlewares/is-admin'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isAdmin, isBanned, makeCallback(getAllAdmins()))
router.get('/:id', authenticate, isAdmin, isBanned, makeCallback(getAdmin()))
router.patch('/:id', authenticate, isAdmin, isBanned, makeCallback(updateAdmin()))
router.patch('/:id', authenticate, isAdmin, isBanned, makeCallback(banAdmin()))
router.patch('/caregiver/:id', authenticate, isAdmin, isBanned, makeCallback(banCaregiver()))
router.patch('/patient/:id', authenticate, isAdmin, isBanned, makeCallback(banPatient()))

export { router as adminRouter }
