import type { NextFunction, Request, Response } from 'express'

import { DESIGNATION } from '@/interfaces/designations'
import { db } from '@/database'
import { Exception } from '@/utils'
import { StatusCodes } from 'http-status-codes'

export default async function isBanned(request: Request, _response: Response, next: NextFunction) {
	let user
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await db.admins.findById(request.account.id)
	} else if (request.account?.designation === DESIGNATION.CAREGIVER) {
		user = await db.caregivers.findById(request.account.id)
	} else if (request.account?.designation === DESIGNATION.PATIENT) {
		user = await db.patients.findById(request.account.id)
	}

	if (user?.isBanned) {
		return next(new Exception('You have been banned from accessing the system', StatusCodes.FORBIDDEN))
	}

	return next(new Exception('Invalid user designation', StatusCodes.FORBIDDEN))
}
