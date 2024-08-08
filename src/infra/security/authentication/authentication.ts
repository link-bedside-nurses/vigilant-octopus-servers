import * as jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ITokenPayload } from '../../../services/token';
import HTTPException from '../../../core/utils/exception';
import { envars } from '../../../config/constants';

export default function authenticate(request: Request, _response: Response, next: NextFunction) {
	if (
		!request.headers.authorization ||
		!request.headers.authorization.split(' ').includes('Bearer')
	) {
		return next(new HTTPException('Unauthorized!', StatusCodes.UNAUTHORIZED));
	}

	const token = request.headers.authorization.split('Bearer ')[1].trim();

	if (!token) return next(new HTTPException('Missing token!', StatusCodes.UNAUTHORIZED));

	const decoded = jwt.verify(token, envars.ACCESS_TOKEN_SECRET) as ITokenPayload;

	if (!decoded || !decoded.id)
		return next(new HTTPException('Invalid Access Token!', StatusCodes.UNAUTHORIZED));

	request.account = {
		id: decoded.id,
		phone: decoded.phone,
		email: decoded.email,
		designation: decoded.designation,
	};

	next();
}
