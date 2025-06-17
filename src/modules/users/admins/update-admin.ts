import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../database/repositories/admin-repository';
import { UpdateAdminDto } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

export function updateAdmin() {
	return async function ( request: HTTPRequest<{ id: string }, UpdateAdminDto> ) {
		console.log( 'calling updateAdmin' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const admin = await AdminRepo.updateAdmin( request.params.id, request.body );
		if ( !admin ) {
			console.log( 'No admin Found' );
			return response( StatusCodes.OK, null, 'No admin Found' );
		}
		console.log( 'Admin updated' );
		return response( StatusCodes.OK, admin, 'Admin updated' );
	};
}
