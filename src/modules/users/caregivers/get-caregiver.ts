import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infrastructure/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function getCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const caregiver = await CaregiverRepo.getCaregiverById(request.params.id);

		if (!caregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No caregiver Found');
		}

		return response(StatusCodes.OK, caregiver, 'Caregiver Retrieved');
	};
}
