import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../utils/http-response';
import { PatientRepo } from '../../../database/repositories/patient-repository';

export function getAllPatients() {
	return async function ( _: HTTPRequest<object> ) {
		console.log( 'calling getAllPatients' );
		const patients = await PatientRepo.getAllPatients();
		console.log( 'patients', patients );
		return response( StatusCodes.OK, patients, 'Patients Retrieved' );
	};
}
