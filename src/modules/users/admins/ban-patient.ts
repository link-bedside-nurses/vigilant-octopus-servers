import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { PatientRepo } from '../../../infrastructure/database/repositories/patient-repository';
import { response } from '../../../core/utils/http-response';

export function banPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const bannedPatient = await PatientRepo.banPatient(request.params.id);
		if (!bannedPatient) {
			return response(StatusCodes.NOT_FOUND, null, 'No such patient Found');
		}
		return response(
			StatusCodes.OK,
			bannedPatient,
			'Patient Successfully banned from using the application!'
		);
	};
}
