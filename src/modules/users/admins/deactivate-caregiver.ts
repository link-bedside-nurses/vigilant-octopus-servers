import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function deactivateCaregiver() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling deactivateCaregiver' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const caregiver = await CaregiverRepo.deactivateCaregiver( request.params.id );
		console.log( 'caregiver', caregiver );
		if ( !caregiver ) {
			console.log( 'No caregiver Found' );
			return response( StatusCodes.NOT_FOUND, null, 'No caregiver Found' );
		}
		console.log( 'Account successfully deactivated' );
		return response( StatusCodes.OK, caregiver, 'Account successfully deactivated' );
	};
}
