import * as jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { Exception, Logger } from '@/utils'
import { EnvironmentVars } from '@/constants'
import { ACCOUNT } from '@/interfaces'

export default function authenticate(request: Request, _response: Response, next: NextFunction) {
	if (!request.headers.authorization || !request.headers.authorization.split(' ').includes('Bearer')) {
		return next(new Exception('Unauthorized access', StatusCodes.UNAUTHORIZED))
	}

	const token = request.headers.authorization.split('Bearer ')[1].trim()
	// TODO: remove this logger later on.
	if (process.env.NODE_ENV === 'development') {
		Logger.info(token, 'Access Token')
	}

	if (!token || !jwt.verify(token, EnvironmentVars.getAccessTokenSecret()))
		return next(new Exception('Invalid Access Token!', StatusCodes.UNAUTHORIZED))

	const decoded = jwt.verify(token, EnvironmentVars.getAccessTokenSecret()) as ACCOUNT
	if (!decoded || !decoded.id) return next(new Exception('Invalid Access Token!', StatusCodes.UNAUTHORIZED))

	request.account = {
		id: decoded.id,
		phone: decoded.phone,
		designation: decoded.designation,
	}
	next()
}
