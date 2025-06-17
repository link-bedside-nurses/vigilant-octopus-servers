import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../utils/http-response';
import { PatientRepo } from '../../../database/repositories/patient-repository';

export function deactivatePatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling deactivatePatient' );
		console.log( 'request.params.id', request.params.id );
		const patient = await PatientRepo.deactivatePatient( request.params.id );
		console.log( 'patient', patient );

		if ( !patient ) {
			return response( StatusCodes.OK, null, 'No Patient Found' );
		}
		console.log( 'patient updated' );
		return response( StatusCodes.OK, patient, 'Patient updated' );
	};
}
