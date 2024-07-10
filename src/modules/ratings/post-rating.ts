import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CreateRatingDto, CreateRatingSchema } from '../../core/interfaces/dtos';
import { response } from '../../core/utils/http-response';
import { CaregiverRepo } from '../../infrastructure/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infrastructure/database/repositories/patient-repository';
import { RatingRepo } from '../../infrastructure/database/repositories/rating-repository';

export function postRating() {
	return async function (request: HTTPRequest<object, CreateRatingDto, object>) {
		const result = CreateRatingSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
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
