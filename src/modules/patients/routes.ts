import callback from '@/adapters/express-callback'
import { Router } from 'express'

import {
	deactivatePatient,
	deletePatient,
	getAllPatients,
	getPatient,
	updatePatient,
} from '@/modules/patients/controller'
import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get( '/', authenticate, isBanned, callback( getAllPatients() ) )
router.get( '/:id', authenticate, isBanned, callback( getPatient() ) )
router.patch( '/:id', authenticate, isBanned, callback( updatePatient() ) )
router.patch( '/deactivate/:id', authenticate, isBanned, callback( deactivatePatient() ) )
router.delete( '/:id', authenticate, isBanned, callback( deletePatient() ) )

export default router
