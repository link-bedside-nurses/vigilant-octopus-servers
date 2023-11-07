import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import {
	getAllAdmins,
	getAdmin,
	updateAdmin,
	banAdmin,
	banCaregiver,
	banPatient,
	verifyCaregiver,
	verifyPatient,
} from '@/modules/admins/controller'
import isAdmin from '@/middlewares/is-admin'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isAdmin, isBanned, makeCallback(getAllAdmins()))
router.get('/:id', authenticate, isAdmin, isBanned, makeCallback(getAdmin()))
router.patch('/:id', authenticate, isAdmin, isBanned, makeCallback(updateAdmin()))

router.patch('/ban/:id', authenticate, isAdmin, isBanned, makeCallback(banAdmin()))
router.patch('/ban/caregiver/:id', authenticate, isAdmin, isBanned, makeCallback(banCaregiver()))
router.patch('/ban/patient/:id', authenticate, isAdmin, isBanned, makeCallback(banPatient()))

router.patch('/verify/caregiver/:id', authenticate, isAdmin, isBanned, makeCallback(verifyCaregiver()))
router.patch('/verify/patient/:id', authenticate, isAdmin, isBanned, makeCallback(verifyPatient()))

export { router as adminRouter }
