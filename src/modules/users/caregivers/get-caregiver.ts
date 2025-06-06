import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function getCaregiver() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling getCaregiver' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const caregiver = await CaregiverRepo.getCaregiverById( request.params.id );
		console.log( 'caregiver', caregiver );
		if ( !caregiver ) {
			console.log( 'No caregiver Found' );
			return response( StatusCodes.OK, null, 'No caregiver Found' );
		}
		console.log( 'caregiver retrieved' );
		return response( StatusCodes.OK, caregiver, 'Caregiver Retrieved' );
	};
}
