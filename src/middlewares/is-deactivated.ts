import type { NextFunction, Request, Response } from 'express'

import { DESIGNATION } from '@/interfaces/designations'
import { db } from '@/db'
import { Exception } from '@/utils'
import { StatusCodes } from 'http-status-codes'

export default async function isDeactivated( request: Request, _response: Response, next: NextFunction ) {
	let user
	if ( request.account?.designation === DESIGNATION.ADMIN ) {
		user = await db.admins.findById( request.account.id )
	} else if ( request.account?.designation === DESIGNATION.CAREGIVER ) {
		user = await db.caregivers.findById( request.account.id )
	} else if ( request.account?.designation === DESIGNATION.PATIENT ) {
		user = await db.patients.findById( request.account.id )
	}

	if ( user?.isDeactivated ) {
		return next( new Exception( 'Your account has been deactivated. Contact support for re-activation', StatusCodes.FORBIDDEN ) )
	}

	return next()
}
