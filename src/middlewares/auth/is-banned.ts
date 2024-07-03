import type { NextFunction, Request, Response } from 'express';

import { db } from '../../db';
import { Exception } from '../../utils';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../interfaces';

export default async function isBanned(request: Request, _response: Response, next: NextFunction) {
	let user;
	if (request.account?.designation === DESIGNATION.ADMIN) {
		user = await db.admins.findById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.NURSE) {
		user = await db.caregivers.findById(request.account.id);
	} else if (request.account?.designation === DESIGNATION.PATIENT) {
		user = await db.patients.findById(request.account.id);
	}

	if (user?.isBanned) {
		return next(
			new Exception('You have been banned from accessing the system', StatusCodes.FORBIDDEN)
		);
	}

	return next();
}
