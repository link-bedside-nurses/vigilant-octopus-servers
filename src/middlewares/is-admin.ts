import { DESIGNATION } from '../interfaces/designations'
import { Exception } from '../utils'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export default function authorized( request: Request, _response: Response, next: NextFunction ) {
	if ( request.account?.designation !== DESIGNATION.ADMIN ) {
		return next( new Exception( 'Only admins can access this!', StatusCodes.FORBIDDEN ) )
	}

	next()
}
