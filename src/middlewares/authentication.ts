import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';

import envars from '../config/env-vars';
import { db } from '../database';
import HTTPException from '../utils/exception';
import logger from '../utils/logger';

export default async function authenticate(request: Request, res: Response, next: NextFunction) {
	if (
		!request.headers.authorization ||
		!request.headers.authorization.split(' ').includes('Bearer')
	) {
		return next(new HTTPException('Unauthorized!', StatusCodes.UNAUTHORIZED));
	}

	const token = request.headers.authorization.split('Bearer ')[1]?.trim();

	if (!token) return next(new HTTPException('Missing token!', StatusCodes.UNAUTHORIZED));

	try {
		const decoded = jwt.verify(token, envars.ACCESS_TOKEN_SECRET) as { iat: number; id: string };
		console.log('decoded::', decoded);

		if (!decoded || !decoded.id)
			return next(new HTTPException('Invalid Access Token!', StatusCodes.UNAUTHORIZED));

		// check if the user with this id exists
		const patient = await db.patients.findById(decoded.id);
		const admin = await db.admins.findById(decoded.id);

		if (!patient && !admin) {
			logger.info('user not found');
			return next(new HTTPException('User not found!', StatusCodes.UNAUTHORIZED));
		}

		// Set account info based on user type
		if (patient) {
			request.account = {
				id: decoded.id,
				phone: patient.phone,
				type: 'patient',
			};
		} else if (admin) {
			request.account = {
				id: decoded.id,
				email: admin.email,
				type: 'admin',
			};
		}

		next();
	} catch (error) {
		return next(new HTTPException('Invalid token!', StatusCodes.UNAUTHORIZED));
	}
}
