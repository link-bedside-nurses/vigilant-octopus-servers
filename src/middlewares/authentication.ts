import * as jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { Exception } from '@/utils'
import { EnvironmentVars } from '@/constants'
import { ITokenPayload } from '@/services/token/token'

export default function authenticate( request: Request, _response: Response, next: NextFunction ) {
	if ( !request.headers.authorization || !request.headers.authorization.split( ' ' ).includes( 'Bearer' ) ) {
		return next( new Exception( 'Unauthorized!', StatusCodes.UNAUTHORIZED ) )
	}

	const token = request.headers.authorization.split( 'Bearer ' )[1].trim()

	if ( !token ) return next( new Exception( 'Missing token!', StatusCodes.UNAUTHORIZED ) )

	const decoded = jwt.verify( token, EnvironmentVars.getAccessTokenSecret() ) as ITokenPayload

	if ( !decoded || !decoded.id ) return next( new Exception( 'Invalid Access Token!', StatusCodes.UNAUTHORIZED ) )

	request.account = {
		id: decoded.id,
		phone: decoded.phone,
		email: decoded.email,
		designation: decoded.designation,
	}
	next()
}
