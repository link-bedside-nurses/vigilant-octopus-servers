import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../database/repositories/caregiver-repository';
import { response } from '../../../utils/http-response';

export function verifyCaregiver() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling verifyCaregiver' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const verifiedCaregiver = await CaregiverRepo.verifyCaregiver( request.params.id );
		if ( !verifiedCaregiver ) {
			console.log( 'No such caregiver Found' );
			return response( StatusCodes.OK, null, 'No such caregiver Found' );
		}
		console.log( 'Caregiver verified' );
		return response( StatusCodes.OK, verifiedCaregiver, 'Caregiver verified' );
	};
}
