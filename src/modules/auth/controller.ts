import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'
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
	return async function (request: HTTPRequest<object, SignUpBody>) {
		const { phone, password, firstName, lastName } = request.body

		if (!phone || !password || !firstName || !lastName) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const patient = await db.patients.findOne({ phone })

		if (patient) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		})
		const user = await db.patients.create({
			phone,
			firstName,
			lastName,
			designation: DESIGNATION.PATIENT,
			password: hash,
		})

		await user.save()

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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
	return async function (request: HTTPRequest<object, SignUpBody>) {
		const { phone, password, firstName, lastName } = request.body

		if (!phone || !password || !firstName || !lastName) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const caregiver = await db.caregivers.findOne({ phone })

		if (caregiver) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		})
		const user = await db.caregivers.create({
			phone,
			firstName,
			lastName,
			designation: DESIGNATION.CAREGIVER,
			password: hash,
		})

		await user.save()

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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
	return async function (request: HTTPRequest<object, SignUpBody>) {
		const { phone, password, firstName, lastName } = request.body

		if (!phone || !password || !firstName || !lastName) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.admins.findOne({ phone })

		if (user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		})
		const newUser = await db.admins.create({
			phone,
			firstName,
			lastName,
			designation: DESIGNATION.ADMIN,
			password: hash,
		})

		await newUser.save()

		const token = createAccessToken(newUser as Document & ACCOUNT)

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

interface SignInBody {
	phone: string
	password: string
}

export function patientSignin() {
	return async function (request: HTTPRequest<object, SignInBody>) {
		const { phone, password } = request.body

		if (!phone || !password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.patients.findOne({ phone })

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			}
		}

		const match = await argon2.verify(user.password, password, {
			type: argon2.argon2id,
		})

		if (!match) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			}
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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
	return async function (request: HTTPRequest<object, SignInBody>) {
		const { phone, password } = request.body

		if (!phone || !password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.caregivers.findOne({ phone })

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			}
		}

		const match = await argon2.verify(user.password, password, {
			type: argon2.argon2id,
		})

		if (!match) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			}
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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
	return async function (request: HTTPRequest<object, SignInBody>) {
		const { phone, password } = request.body

		if (!phone || !password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'some fields are missing',
					data: null,
				},
			}
		}

		const user = await db.admins.findOne({ phone })

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			}
		}

		const match = await argon2.verify(user.password, password, {
			type: argon2.argon2id,
		})

		if (!match) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			}
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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

export function passwordReset() {
	return async function (
		request: HTTPRequest<{ id: string }, { password: string; phone: string }, { designation: DESIGNATION }>,
	) {
		const { password, phone } = request.body

		const designation = request.query.designation

		if (!designation) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Designation must be specified as a query param',
					data: null,
				},
			}
		}

		if (!password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Password is required',
					data: null,
				},
			}
		}

		let user
		if (designation === DESIGNATION.PATIENT) {
			user = await db.patients.findOne({ phone })
		} else if (designation === DESIGNATION.CAREGIVER) {
			user = await db.caregivers.findOne({ phone })
		} else if (designation === DESIGNATION.ADMIN) {
			user = await db.caregivers.findOne({ phone })
		} else {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Designation',
					data: null,
				},
			}
		}

		if (!user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: user,
					message: 'No user found',
				},
			}
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		})

		user.password = hash

		await user.save()

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				refreshToken,
				message: 'Password has been successfully reset!',
			},
		}
	}
}

export function getAccessToken() {
	return async function (request: HTTPRequest) {
		const designation = request.account?.designation

		if (!designation) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Designation must be specified as a param',
					data: null,
				},
			}
		}

		let user
		if (designation === DESIGNATION.PATIENT) {
			user = await db.patients.findById(request.account?.id)
		} else if (designation === DESIGNATION.CAREGIVER) {
			user = await db.caregivers.findById(request.account?.id)
		} else if (designation === DESIGNATION.ADMIN) {
			user = await db.caregivers.findById(request.account?.id)
		} else {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Designation',
					data: null,
				},
			}
		}

		if (!user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: user,
					message: 'No user found',
				},
			}
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT)
		const refreshToken = createRefreshToken(user as Document & ACCOUNT)

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
