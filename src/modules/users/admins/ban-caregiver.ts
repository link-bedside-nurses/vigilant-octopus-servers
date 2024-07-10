import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infrastructure/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function banCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const bannedCaregiver = await CaregiverRepo.banCaregiver(request.params.id);
		if (!bannedCaregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No such caregiver Found');
		}
		return response(
			StatusCodes.OK,
			bannedCaregiver,
			'Caregiver Successfully banned from using the application'
		);
	};
}
