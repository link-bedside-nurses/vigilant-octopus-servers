import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { UpdateAdminSchema, UpdateCaregiverDto } from '../../../interfaces/dtos';
import { CaregiverRepo } from '../../users/caregivers/repo';
import { response } from '../../../utils/http-response';

export function completeCaregiverProfile() {
	return async function (request: HTTPRequest<object, UpdateCaregiverDto>) {
		const result = UpdateAdminSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation Error', result.error);
		}

		const updatedCaregiver = await CaregiverRepo.findByIdAndUpdate(
			request.account?.id!,
			request.body
		);
		return response(StatusCodes.OK, updatedCaregiver, 'Profile updated');
	};
}
