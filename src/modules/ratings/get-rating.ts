import { HTTPRequest } from '../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { RatingRepo } from '../../database/repositories/rating-repository';

export function getRating() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const rating = await RatingRepo.getRatingById( request.params.id );
		if ( !rating ) {
			return response( StatusCodes.OK, null, 'Not such rating' );
		}
		return response( StatusCodes.OK, rating, 'Rating retrieved' );
	};
}
