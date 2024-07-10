import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function getAllPatients() {
	return async function (_: HTTPRequest<object>) {
		const patients = await PatientRepo.getAllPatients();
		return response(StatusCodes.OK, patients, 'Patients Retrieved');
	};
}
