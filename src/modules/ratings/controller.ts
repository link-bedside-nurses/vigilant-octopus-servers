import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getAllRatings() {
	return async function (
		request: HTTPRequest<
			object,
			{
				id: string
			},
			object
		>,
	) {
		const ratings = await db.ratings.findOne({
			caregiverId: request.body.id,
		})

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
	return async function (
		request: HTTPRequest<
			{
				id: string
			},
			object,
			object
		>,
	) {
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

export function addRating() {
	return async function (
		request: HTTPRequest<
			object,
			{
				id: string
				value: number
				description: string
			},
			object
		>,
	) {
		const { description, value, id } = request.body

		if (!description || !value || !id) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'All fields must be sent',
				},
			}
		}

		const rating = await db.ratings.create({
			description,
			value,
			caregiverId: id,
			patientId: request?.account?.id,
		})

		await rating.save()

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating retrieved',
			},
		}
	}
}
