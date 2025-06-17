import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HTTPException from '../utils/exception';
import { verifyRefreshToken } from '../services/token';

export default async function verifyRefreshTokenMiddleware(
	request: Request<object, { refreshToken: string }>,
	_response: Response,
	next: NextFunction
) {
	const refreshToken = request.body.refreshToken;

	if ( !refreshToken || !( await verifyRefreshToken( refreshToken ) ) )
		return next( new HTTPException( 'Invalid refresh Token!', StatusCodes.UNAUTHORIZED ) );

	const decoded = await verifyRefreshToken( refreshToken );
	if ( !decoded || !decoded.id )
		return next( new HTTPException( 'Invalid refresh Token!', StatusCodes.UNAUTHORIZED ) );

	request.account = {
		designation: decoded.designation,
		id: decoded.id,
		phone: '',
	};

	next();
}
