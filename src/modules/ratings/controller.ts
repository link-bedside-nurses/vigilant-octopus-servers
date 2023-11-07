import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getAllRatings() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object>) {
		const ratings = await db.ratings.find({})

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: ratings,
				message: 'Rating retrieved',
			},
		}
	}
}

export function getRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await db.ratings.findById(request.params.id)

		if (!rating) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Not Rating found',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating retrieved',
			},
		}
	}
}
export function getCaregiverRatings() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await db.ratings.find({
			caregiverId: request.params.id,
		})

		if (!rating) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Not Rating found',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating retrieved',
			},
		}
	}
}

export function deleteRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await db.ratings.findByIdAndDelete(request.params.id)

		if (!rating) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Not such rating',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating deleted',
			},
		}
	}
}

export function addRating() {
	return async function (
		request: HTTPRequest<
			{ id: string },
			{
				value: number
				review: string
			}
		>,
	) {
		const { review, value } = request.body
		const { id } = request.params

		if (!review || !value || !id) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'All fields must be sent',
				},
			}
		}

		const rating = await db.ratings.create({
			review,
			value,
			caregiverId: id,
			patientId: request?.account?.id,
		})

		await rating.save()

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating Posted',
			},
		}
	}
}
