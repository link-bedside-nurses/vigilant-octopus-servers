import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../database/repositories/admin-repository';
import { response } from '../../../utils/http-response';

export function getAdmin() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling getAdmin' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const admin = await AdminRepo.getAdminById( request.params.id );
		console.log( 'admin', admin );
		if ( !admin ) {
			console.log( 'No admin Found' );
			return response( StatusCodes.OK, null, 'No admin Found' );
		}
		console.log( 'Admin Retrieved' );
		return response( StatusCodes.OK, admin, 'Admin Retrieved' );
	};
}
