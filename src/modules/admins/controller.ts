/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db'

export function getAllAdmins() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function ( _: HTTPRequest<object> ) {
		const admins = await db.admins.find( {} )

		const t: unknown[] = []
		admins.forEach( admin => {

			const c = {
				_id: admin._id,
				designation: admin.designation,
				phone: admin.phone,
				firstName: admin.firstName,
				lastName: admin.lastName,
				isBanned: admin.isBanned === true ? "TRUE" : "FALSE",
				isPhoneVerified: admin.isPhoneVerified === true ? "TRUE" : "FALSE",
				isDeactivated: admin.isDeactivated === true ? "TRUE" : "FALSE",
				// @ts-ignore
				createdAt: admin.createdAt,
				// @ts-ignore
				updatedAt: admin.updatedAt,
			}

			t.push( c )
		} )
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: t.reverse(),
				message: 'Admins Retrieved',
			},
		}
	}
}

export function getAdmin() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const admin = await db.admins.findById( request.params.id )

		if ( !admin ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: admin,
				message: 'Admin Retrieved',
			},
		}
	}
}

export function banAdmin() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		if ( request.account?.id === request.params.id ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'You cannot ban yourself, Please select a different admin to ban',
					data: null,
				},
			}
		}

		const updatedAmin = await db.admins.findByIdAndUpdate(
			request.params.id,
			{ $set: { isBanned: true } },
			{ new: true },
		)
		if ( !updatedAmin ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: updatedAmin,
				message: 'Admin banned',
			},
		}
	}
}

export function banCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const bannedCaregiver = await db.caregivers.findByIdAndUpdate(
			request.params.id,
			{ $set: { isBanned: true } },
			{ new: true },
		)
		if ( !bannedCaregiver ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such caregiver Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: bannedCaregiver,
				message: 'Caregiver Successfully banned from using the application',
			},
		}
	}
}
export function banPatient() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const bannedPatient = await db.patients.findByIdAndUpdate(
			request.params.id,
			{ $set: { isBanned: true } },
			{ new: true },
		)
		if ( !bannedPatient ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such patient Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: bannedPatient,
				message: 'Patient Successfully banned from using the application!',
			},
		}
	}
}

export function verifyCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const verifiedCaregiver = await db.caregivers.findByIdAndUpdate(
			request.params.id,
			{ isVerified: true },
			{ new: true },
		)
		if ( !verifiedCaregiver ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such caregiver Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: verifiedCaregiver,
				message: 'Caregiver verified',
			},
		}
	}
}

export function verifyPatient() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const verifiedPatient = await db.patients.findByIdAndUpdate(
			request.params.id,
			{ isVerified: true },
			{ new: true },
		)
		if ( !verifiedPatient ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such patient Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: verifiedPatient,
				message: 'Patient verified!',
			},
		}
	}
}

interface UpdateBody {
	phone: string
	firstName: string
	lastName: string
}

export function updateAdmin() {
	return async function (
		request: HTTPRequest<
			{
				id: string
			},
			UpdateBody
		>,
	) {
		const admin = await db.admins.findByIdAndUpdate( request.params.id, { ...request.body }, { new: true } )

		if ( !admin ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: admin,
				message: 'Admin updated',
			},
		}
	}
}
