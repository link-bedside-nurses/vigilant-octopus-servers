import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../utils/http-response';
import { PatientRepo } from '../../../database/repositories/patient-repository';

export function getPatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling getPatient' );
		console.log( 'request.params.id', request.params.id );
		const patient = await PatientRepo.getPatientById( request.params.id );
		console.log( 'patient', patient );
		if ( !patient ) {
			console.log( 'No Patient Found' );
			return response( StatusCodes.OK, null, 'No Patient Found' );
		}
		console.log( 'Patient Retrieved' );
		return response( StatusCodes.OK, patient, 'Patient Retrieved' );
	};
}
