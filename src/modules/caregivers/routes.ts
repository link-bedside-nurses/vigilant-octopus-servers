import callback from '../../adapters/express-callback'
import { Router } from 'express'

import {
	deactivateCaregiver,
	deleteCaregiver,
	getAllCaregivers,
	getCaregiver,
	searchCaregiversByLocation,
	updateCaregiver,
} from '../../modules/caregivers/controller'
import authenticate from '../../middlewares/authentication'
import isBanned from '../../middlewares/is-banned'
const router = Router()

router.get( '/', isBanned, callback( getAllCaregivers() ) )
router.get( '/search', authenticate, isBanned, callback( searchCaregiversByLocation() ) )
router.get( '/:id', authenticate, isBanned, callback( getCaregiver() ) )
router.patch( '/:id', authenticate, isBanned, callback( updateCaregiver() ) )
router.patch( '/deactivate/:id', authenticate, isBanned, callback( deactivateCaregiver() ) )
router.delete( '/:id', authenticate, isBanned, callback( deleteCaregiver() ) )

export default router
