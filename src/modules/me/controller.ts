import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getCurrentUser() {
	return async function (request: HTTPRequest<object>) {
		const user = await db.users.findById(request.account?.id)
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				message: 'User Retrieved',
			},
		}
	}
}
