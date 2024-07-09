import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { RatingRepo } from './repository';
import { CreateRatingDto, CreateRatingSchema } from '../../interfaces/dtos';
import { response } from '../../utils/http-response';
import { CaregiverRepo } from '../users/caregivers/repository';
import { PatientRepo } from '../users/patients/repository';

export function getAllRatings() {
	return async function (_: HTTPRequest<object>) {
		const ratings = await RatingRepo.getAllRatings();
		return response(StatusCodes.OK, ratings, 'Rating retrieved');
	};
}

export function getRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await RatingRepo.getRatingById(request.params.id);
		if (!rating) {
			return response(StatusCodes.NOT_FOUND, null, 'Not such rating');
		}
		return response(StatusCodes.OK, rating, 'Rating retrieved');
	};
}

export function getCaregiverRatings() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const ratings = await RatingRepo.getCaregiverRatings(request.params.id);
		if (ratings.length > 0) {
			return response(StatusCodes.OK, ratings, 'Successfully fetched caregiver ratings');
		} else {
			return response(StatusCodes.NOT_FOUND, null, 'Not such rating');
		}
	};
}

export function deleteRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await RatingRepo.deleteRating(request.params.id);
		if (!rating) {
			return response(StatusCodes.NOT_FOUND, null, 'Not such rating');
		}
		return response(StatusCodes.OK, rating, 'Rating deleted');
	};
}

export function postRating() {
	return async function (request: HTTPRequest<object, CreateRatingDto, object>) {
		const result = CreateRatingSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'All fields must be sent', result.error);
		}
		const caregiver = await CaregiverRepo.getCaregiverById(result.data.caregiver);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'Caregiver not found');
		}

		const patient = await PatientRepo.getPatientById(request.account?.id!);

		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'Patient not found');
		}

		const rating = await RatingRepo.createRating(request.account?.id!, result.data);
		return response(StatusCodes.OK, rating, 'Rating Posted');
	};
}
