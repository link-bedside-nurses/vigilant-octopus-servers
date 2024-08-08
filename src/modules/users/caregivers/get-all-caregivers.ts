import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function getAllCaregivers() {
	return async function (request: HTTPRequest<object, object, { latLng: string }>) {
		const { latLng } = request.query;

		let caregivers = [];
		if (latLng) {
			caregivers = await CaregiverRepo.getAllCaregiversByCoords(latLng);
		} else {
			caregivers = await CaregiverRepo.getAllCaregivers();
		}

		return response(StatusCodes.OK, caregivers, 'Caregivers Retrieved');
	};
}
