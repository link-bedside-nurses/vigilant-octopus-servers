import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'
import { createToken } from '@/token/token'
import { Document } from 'mongoose'
import { ACCOUNT, DESIGNATION } from '@/interfaces'
import * as argon2 from 'argon2'

interface SignUpBody {
	phone: string
	firstName: string
	lastName: string
	designation: DESIGNATION
	password: string
	email?: string
}

export function signup() {
	return async function (request: HTTPRequest<object, SignUpBody>) {
		const { phone, password, designation, firstName, lastName } = request.body

		if (!phone || !password || !designation) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'All fields are required',
					data: null,
				},
			}
		}

		const user = await db.users.findOne({ phone: phone })

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
		const newUser = await db.users.create({
			phone: phone,
			firstName: firstName,
			lastName: lastName,
			designation: designation,
			password: hash,
		})

		await newUser.save()

		const token = createToken(newUser as Document & ACCOUNT)

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
	designation: DESIGNATION
}

export function signin() {
	return async function (request: HTTPRequest<object, SignInBody>) {
		const { phone, password, designation } = request.body

		if (!phone || !password || !designation) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'All fields are required',
					data: null,
				},
			}
		}

		const user = await db.users.findOne({ phone: phone })

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

		const token = createToken(user as Document & ACCOUNT)

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				token,
				message: 'Signed in',
			},
		}
	}
}
