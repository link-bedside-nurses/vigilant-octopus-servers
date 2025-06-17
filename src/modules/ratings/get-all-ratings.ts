import { HTTPRequest } from '../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { RatingRepo } from '../../database/repositories/rating-repository';

export function getAllRatings() {
	return async function ( _: HTTPRequest<object> ) {
		const ratings = await RatingRepo.getAllRatings();
		return response( StatusCodes.OK, ratings, 'Rating retrieved' );
	};
}
