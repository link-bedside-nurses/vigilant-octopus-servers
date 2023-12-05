import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db'
import { createAccessToken, createRefreshToken } from '@/services/token/token'
import { Document } from 'mongoose'
import { ACCOUNT } from '@/interfaces'
import * as argon2 from 'argon2'
import { DESIGNATION } from '@/interfaces/designations'

interface SignUpBody {
	phone: string
	firstName: string
	lastName: string
	password: string
}

export function patientSignup() {
	return async function ( request: HTTPRequest<object, {
		phone: string
		firstName: string
		lastName: string
		email: string
		dob: Date
	}> ) {
		const { phone, dob, firstName, lastName, email } = request.body

		if ( !phone || !dob || !firstName || !lastName || !email ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			}
		}

		const patient = await db.patients.findOne( { phone } )

		if ( patient ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const user = await db.patients.create( {
			phone,
			firstName,
			lastName,
			email,
			designation: DESIGNATION.PATIENT,
			dob
		} )

		await user.save()

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Account created',
			},
		}
	}
}

export function caregiverSignup() {
	return async function ( request: HTTPRequest<object, SignUpBody> ) {
		const { phone, password, firstName, lastName } = request.body

		if ( !phone || !password || !firstName || !lastName ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			}
		}

		const caregiver = await db.caregivers.findOne( { phone } )

		if ( caregiver ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const hash = await argon2.hash( password, {
			type: argon2.argon2id,
		} )
		const user = await db.caregivers.create( {
			phone,
			firstName,
			lastName,
			designation: DESIGNATION.CAREGIVER,
			password: hash,
		} )

		await user.save()

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Account created',
			},
		}
	}
}

export function adminSignup() {
	return async function ( request: HTTPRequest<object, SignUpBody> ) {
		const { phone, password, firstName, lastName } = request.body

		if ( !phone || !password || !firstName || !lastName ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.admins.findOne( { phone } )

		if ( user ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const hash = await argon2.hash( password, {
			type: argon2.argon2id,
		} )
		const newUser = await db.admins.create( {
			phone,
			firstName,
			lastName,
			designation: DESIGNATION.ADMIN,
			password: hash,
		} )

		await newUser.save()

		const token = createAccessToken( newUser as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: newUser,
				token,
				message: 'Account created',
			},
		}
	}
}

export function patientSignin() {
	return async function ( request: HTTPRequest<object, {
		phone: string
	}> ) {
		const { phone } = request.body

		if ( !request.body.phone ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone must be specified!',
					data: null,
				},
			}
		}

		const user = await db.patients.findOne( { phone } )

		if ( !user ) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'No such user found',
					data: null,
				},
			}
		}

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Signed in',
			},
		}
	}
}

export function caregiverSignin() {
	return async function ( request: HTTPRequest<object, { phone: string, password: string }> ) {
		const { phone, password } = request.body

		if ( !phone || !password ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.caregivers.findOne( { phone } )

		if ( !user ) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			}
		}

		const match = await argon2.verify( user.password, password, {
			type: argon2.argon2id,
		} )

		if ( !match ) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			}
		}

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Signed in',
			},
		}
	}
}

export function adminSignin() {
	return async function ( request: HTTPRequest<object, { phone: string, password: string }> ) {
		const { phone, password } = request.body

		if ( !phone || !password ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.admins.findOne( { phone } )

		if ( !user ) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			}
		}

		const match = await argon2.verify( user.password, password, {
			type: argon2.argon2id,
		} )

		if ( !match ) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			}
		}

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Signed in',
			},
		}
	}
}

export function getAccessToken() {
	return async function ( request: HTTPRequest<object, object, { designation: DESIGNATION }> ) {
		const designation = request.query.designation

		if ( !designation ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Designation must be specified',
					data: null,
				},
			}
		}

		let user
		if ( designation === DESIGNATION.PATIENT ) {
			user = await db.patients.findById( request.account?.id )
		} else if ( designation === DESIGNATION.CAREGIVER ) {
			user = await db.caregivers.findById( request.account?.id )
		} else if ( designation === DESIGNATION.ADMIN ) {
			user = await db.caregivers.findById( request.account?.id )
		} else {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Designation',
					data: null,
				},
			}
		}

		if ( !user ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: user,
					message: 'No user found',
				},
			}
		}

		const accessToken = createAccessToken( user as Document & ACCOUNT )
		const refreshToken = createRefreshToken( user as Document & ACCOUNT )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: null,
				accessToken,
				refreshToken,
				message: 'Access token has been reset!',
			},
		}
	}
}
