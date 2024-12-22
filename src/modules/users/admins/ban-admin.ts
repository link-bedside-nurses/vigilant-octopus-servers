import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { response } from '../../../core/utils/http-response';

export function banAdmin() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling banAdmin' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		if ( request.account?.id === request.params.id ) {
			console.log( 'You cannot ban yourself, Please select a different admin to ban' );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'You cannot ban yourself, Please select a different admin to ban'
			);
		}
		const updatedAdmin = await AdminRepo.banAdmin( request.params.id );
		console.log( 'updatedAdmin', updatedAdmin );
		if ( !updatedAdmin ) {
			console.log( 'No admin Found' );
			return response( StatusCodes.NOT_FOUND, null, 'No admin Found' );
		}
		console.log( 'Admin banned successfully', updatedAdmin );
		return response( StatusCodes.OK, updatedAdmin, 'Admin banned' );
	};
}
