import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { UpdateCaregiverDto } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';

export function updateCaregiver() {
	return async function ( request: HTTPRequest<{ id: string }, UpdateCaregiverDto> ) {
		console.log( 'calling updateCaregiver' );
		console.log( 'request.params.id', request.params.id );
		console.log( 'request.body', request.body );
		const updated = request.body;
		console.log( 'updated', updated );
		const caregiver = await CaregiverRepo.findByIdAndUpdate( request.params.id, updated );
		console.log( 'caregiver', caregiver );

		if ( !caregiver ) {
			return response( StatusCodes.OK, null, 'No caregiver Found' );
		}
		console.log( 'caregiver updated' );
		return response( StatusCodes.OK, caregiver, 'Caregiver updated' );
	};
}
