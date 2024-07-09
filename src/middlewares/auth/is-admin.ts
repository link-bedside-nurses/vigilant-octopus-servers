import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../interfaces';
import HTTPException from '../../utils/exception';

export default function authorized(request: Request, _response: Response, next: NextFunction) {
	if (request.account?.designation !== DESIGNATION.ADMIN) {
		return next(new HTTPException('Only admins can access this!', StatusCodes.FORBIDDEN));
	}

	next();
}
