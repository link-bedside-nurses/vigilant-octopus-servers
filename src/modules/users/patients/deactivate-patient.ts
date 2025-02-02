import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function deactivatePatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling deactivatePatient' );
		console.log( 'request.params.id', request.params.id );
		const patient = await PatientRepo.deactivatePatient( request.params.id );
		console.log( 'patient', patient );

		if ( !patient ) {
			return response( StatusCodes.NOT_FOUND, null, 'No Patient Found' );
		}
		console.log( 'patient updated' );
		return response( StatusCodes.OK, patient, 'Patient updated' );
	};
}
