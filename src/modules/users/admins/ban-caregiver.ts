import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function banCaregiver() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling banCaregiver' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const bannedCaregiver = await CaregiverRepo.banCaregiver( request.params.id );
		console.log( 'bannedCaregiver', bannedCaregiver );
		if ( !bannedCaregiver ) {
			console.log( 'No such caregiver Found' );
			return response( StatusCodes.NOT_FOUND, null, 'No such caregiver Found' );
		}
		console.log( 'Caregiver Successfully banned from using the application' );
		return response(
			StatusCodes.OK,
			bannedCaregiver,
			'Caregiver Successfully banned from using the application'
		);
	};
}
