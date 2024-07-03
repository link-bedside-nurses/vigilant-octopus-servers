import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { RatingRepo } from './repo';
import { CreateRatingDto } from '../../interfaces/dtos';

export function getAllRatings() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object>) {
		const ratings = await RatingRepo.getAllRatings();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: ratings,
				message: 'Rating retrieved',
			},
		};
	};
}

export function getRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await RatingRepo.getRatingById(request.params.id);

		if (!rating) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Not Rating found',
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating retrieved',
			},
		};
	};
}

export function getCaregiverRatings() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const ratings = await RatingRepo.getCaregiverRatings(request.params.id);

		if (ratings.length > 0) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: ratings,
					message: 'Successfully fetched caregiver ratings',
				},
			};
		} else {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: [],
					message: 'No Rating Found',
				},
			};
		}
	};
}

export function deleteRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await RatingRepo.deleteRating(request.params.id);

		if (!rating) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Not such rating',
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating deleted',
			},
		};
	};
}

export function creatRating() {
	return async function (request: HTTPRequest<{ id: string }, CreateRatingDto>) {
		if (!request.body.review || !request.body.value || !request.body.caregiverId) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'All fields must be sent',
				},
			};
		}
		const rating = await RatingRepo.createRating(request.account?.id!, request.body);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: rating,
				message: 'Rating Posted',
			},
		};
	};
}
