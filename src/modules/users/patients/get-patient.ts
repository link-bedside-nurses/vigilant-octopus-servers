import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infrastructure/database/repositories/patient-repository';

export function getPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const patient = await PatientRepo.getPatientById(request.params.id);
		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}
		return response(StatusCodes.OK, patient, 'Patient Retrieved');
	};
}
