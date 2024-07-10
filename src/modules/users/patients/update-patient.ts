import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { UpdatePatientDto } from '../../../core/interfaces/dtos';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function updatePatient() {
	return async function (request: HTTPRequest<{ id: string }, UpdatePatientDto>) {
		const patient = await PatientRepo.updatePatient(request.params.id, request.body);

		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}

		return response(StatusCodes.OK, patient, 'Patient updated');
	};
}
