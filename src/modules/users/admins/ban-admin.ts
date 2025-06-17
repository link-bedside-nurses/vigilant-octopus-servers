import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../database/repositories/admin-repository';
import { response } from '../../../utils/http-response';

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
			return response( StatusCodes.OK, null, 'No admin Found' );
		}
		console.log( 'Admin banned successfully', updatedAdmin );
		return response( StatusCodes.OK, updatedAdmin, 'Admin banned' );
	};
}
