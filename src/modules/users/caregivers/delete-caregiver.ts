import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function deleteCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const caregiver = await CaregiverRepo.deleteCaregiver(request.params.id);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver deleted');
	};
}
