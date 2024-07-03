import type { NextFunction, Request, Response } from 'express';

import { db } from '../../db';
import { Exception } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../interfaces';

export default async function isDeactivated(
	request: Request,
	_response: Response,
	next: NextFunction
) {
	let user;
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await db.admins.findById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.NURSE) {
		user = await db.caregivers.findById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.PATIENT) {
		user = await db.patients.findById(request.account.id);
	}

	if (user?.isDeactivated) {
		return next(
			new Exception(
				'Your account has been deactivated. Contact support for re-activation',
				StatusCodes.FORBIDDEN
			)
		);
	}

	return next();
}
