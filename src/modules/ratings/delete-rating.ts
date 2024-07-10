import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { RatingRepo } from '../../infrastructure/database/repositories/rating-repository';

export function deleteRating() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const rating = await RatingRepo.deleteRating(request.params.id);
		if (!rating) {
			return response(StatusCodes.NOT_FOUND, null, 'Not such rating');
		}
		return response(StatusCodes.OK, rating, 'Rating deleted');
	};
}
