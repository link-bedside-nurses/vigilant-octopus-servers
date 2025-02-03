import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { UpdatePatientDto } from '../../../core/interfaces/dtos';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function updatePatient() {
	return async function ( request: HTTPRequest<{ id: string }, UpdatePatientDto> ) {
		console.log( 'calling updatePatient' );
		console.log( 'request.params.id', request.params.id );
		const patient = await PatientRepo.updatePatient( request.params.id, request.body );
		console.log( 'patient', patient );
		if ( !patient ) {
			console.log( 'No Patient Found' );
			return response( StatusCodes.OK, null, 'No Patient Found' );
		}
		console.log( 'Patient updated' );
		return response( StatusCodes.OK, patient, 'Patient updated' );
	};
}
