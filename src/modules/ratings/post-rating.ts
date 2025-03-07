import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CreateRatingDto, CreateRatingSchema } from '../../core/interfaces/dtos';
import { response } from '../../core/utils/http-response';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import { RatingRepo } from '../../infra/database/repositories/rating-repository';

export function postRating() {
	return async function ( request: HTTPRequest<object, CreateRatingDto, object> ) {
		const result = CreateRatingSchema.safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		const caregiver = await CaregiverRepo.getCaregiverById( result.data.caregiver );

		if ( !caregiver ) {
			return response( StatusCodes.OK, null, 'Caregiver not found' );
		}

		const patient = await PatientRepo.getPatientById( request.account?.id! );

		if ( !patient ) {
			return response( StatusCodes.OK, null, 'Patient not found' );
		}

		const rating = await RatingRepo.createRating( request.account?.id!, result.data );
		return response( StatusCodes.OK, rating, 'Rating Posted' );
	};
}
