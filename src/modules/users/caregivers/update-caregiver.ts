import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { UpdateCaregiverDto } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';

export function updateCaregiver() {
	return async function (request: HTTPRequest<{ id: string }, UpdateCaregiverDto>) {
		const updated = request.body;
		const caregiver = await CaregiverRepo.findByIdAndUpdate(request.params.id, updated);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver updated');
	};
}
