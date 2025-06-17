import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { PatientRepo } from '../../../database/repositories/patient-repository';
import { response } from '../../../utils/http-response';

export function verifyPatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		console.log( 'calling verifyPatient' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const verifiedPatient = await PatientRepo.verifyPatient( request.params.id );
		if ( !verifiedPatient ) {
			console.log( 'No such patient Found' );
			return response( StatusCodes.OK, null, 'No such patient Found' );
		}
		console.log( 'Patient verified!' );
		return response( StatusCodes.OK, verifiedPatient, 'Patient verified!' );
	};
}
