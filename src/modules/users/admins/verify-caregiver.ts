import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function verifyCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const verifiedCaregiver = await CaregiverRepo.verifyCaregiver(request.params.id);
		if (!verifiedCaregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No such caregiver Found');
		}
		return response(StatusCodes.OK, verifiedCaregiver, 'Caregiver verified');
	};
}
