import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { PatientRepo } from '../../../database/repositories/patient-repository';
import { response } from '../../../utils/http-response';

export function banPatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling banPatient' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const bannedPatient = await PatientRepo.banPatient( request.params.id );
		console.log( 'bannedPatient', bannedPatient );
		if ( !bannedPatient ) {
			console.log( 'No such patient Found' );
			return response( StatusCodes.OK, null, 'No such patient Found' );
		}
		console.log( 'Patient Successfully banned from using the application!' );
		return response(
			StatusCodes.OK,
			bannedPatient,
			'Patient Successfully banned from using the application!'
		);
	};
}
