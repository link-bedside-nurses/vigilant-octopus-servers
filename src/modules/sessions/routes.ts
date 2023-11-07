import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import {
	cancelSession,
	confirmSession,
	getSession,
	getAllSessions,
	getPatientSessions,
	getCaregiverSessions,
	deleteSession,
} from '@/modules/sessions/controller'
import authenticate from '@/middlewares/authentication'
import { validateObjectID } from '@/middlewares/validate-objectid'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isBanned, makeCallback(getAllSessions()))
router.get('/:id', authenticate, validateObjectID, isBanned, makeCallback(getSession()))
router.get('/patients/:id', authenticate, validateObjectID, isBanned, makeCallback(getPatientSessions()))
router.get('/caregivers/:id', authenticate, validateObjectID, isBanned, makeCallback(getCaregiverSessions()))

router.patch('/confirm/:id', authenticate, validateObjectID, isBanned, makeCallback(confirmSession()))
router.patch('/cancel/:id', authenticate, validateObjectID, isBanned, makeCallback(cancelSession()))
router.delete('/:id', authenticate, validateObjectID, isBanned, makeCallback(deleteSession()))

export { router as sessionRouter }
