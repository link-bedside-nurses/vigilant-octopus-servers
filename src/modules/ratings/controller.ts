import { HTTPRequest } from '../../adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '../../db'

export function getAllRatings() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function ( _: HTTPRequest<object> ) {
		const ratings = await db.ratings.find( {} ).sort( { createdAt: "desc" } ).populate( 'patient' ).populate( 'caregiver' )

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
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const rating = await db.ratings.findById( request.params.id ).populate( 'patient' ).populate( 'caregiver' )

		if ( !rating ) {
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
	return async function ( request: HTTPRequest<{ id: string }, object, object> ) {
		const ratings = await db.ratings.find( {
			caregiver: {
				_id: request.params.id
			}
		} ).populate( 'patient' ).populate( 'caregiver' ).sort( { createdAt: "desc" } )


		if ( ratings.length > 0 ) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: ratings,
					message: 'Successfully fetched caregiver ratings',
				},
			}
		} else {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: [],
					message: 'No Rating Found',
				},
			}
		}
	}
}

export function deleteRating() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const rating = await db.ratings.findByIdAndDelete( request.params.id ).populate( 'patient' ).populate( 'caregiver' )

		if ( !rating ) {
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

		if ( !review || !value || !id ) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'All fields must be sent',
				},
			}
		}

		const rating = await db.ratings.create( {
			review,
			value,
			caregiver: id,
			patient: request?.account?.id,
		} ).then( r => r.populate( 'patient' ).then( r => r.populate( 'caregiver' ) ) )

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
