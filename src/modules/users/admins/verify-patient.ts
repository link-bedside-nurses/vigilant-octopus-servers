import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';
import { response } from '../../../core/utils/http-response';

export function verifyPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const verifiedPatient = await PatientRepo.verifyPatient(request.params.id);
		if (!verifiedPatient) {
			return response(StatusCodes.NOT_FOUND, null, 'No such patient Found');
		}
		return response(StatusCodes.OK, verifiedPatient, 'Patient verified!');
	};
}
