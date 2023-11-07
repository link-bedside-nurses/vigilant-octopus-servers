import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'
import { DESIGNATION } from '@/interfaces/designations'

export function getCurrentUser() {
	return async function (request: HTTPRequest<object>) {
		const designation = request.account?.designation

		let user
		if (designation === DESIGNATION.CAREGIVER) {
			user = await db.caregivers.findById(request.account?.id)
		} else if (designation === DESIGNATION.PATIENT) {
			user = await db.patients.findById(request.account?.id)
		} else if (designation === DESIGNATION.ADMIN) {
			user = await db.admins.findById(request.account?.id)
		} else {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Invalid Designation',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				message: 'User Retrieved',
			},
		}
	}
}
