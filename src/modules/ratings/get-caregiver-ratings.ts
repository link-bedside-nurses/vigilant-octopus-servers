import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { RatingRepo } from '../../infra/database/repositories/rating-repository';

export function getCaregiverRatings() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const ratings = await RatingRepo.getCaregiverRatings(request.params.id);

		return response(StatusCodes.OK, ratings, 'Successfully fetched caregiver ratings');
	};
}
