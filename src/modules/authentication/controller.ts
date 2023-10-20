import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'
import { createToken } from '@/token/token'
import { Document } from 'mongoose'
import { ACCOUNT, DESIGNATION } from '@/interfaces'

export function signup() {
	return async function (
		request: HTTPRequest<
			object,
			{
				phone: string
				firstName: string
				lastName: string
				designation: DESIGNATION
			}
		>,
	) {
		const user = await db.users.findOne({ phone: request.body.phone })

		if (user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			}
		}

		const newUser = await db.users.create({
			phone: request.body.phone,
			firstName: request.body.firstName,
			lastName: request.body.lastName,
			designation: request.body.designation,
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

export function signin() {
	return async function (request: HTTPRequest<object, { phone: string; designation: DESIGNATION }>) {
		const user = await db.users.findOne({ phone: request.body.phone })

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
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
