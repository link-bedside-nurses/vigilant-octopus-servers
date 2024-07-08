import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../interfaces';
import { AdminRepo } from '../../users/admins/repository';
import { CaregiverRepo } from '../../users/caregivers/repository';
import { PatientRepo } from '../../users/patients/repository';
import { response } from '../../../utils/http-response';

export function getCurrentUser() {
	return async function (request: HTTPRequest<object>) {
		const { designation, id: userId } = request.account!;

		if (!userId) {
			return response(StatusCodes.UNAUTHORIZED, null, 'User not authenticated');
		}

		let user;
		switch (designation) {
			case DESIGNATION.CAREGIVER:
				user = await CaregiverRepo.getCaregiverById(userId);
				break;
			case DESIGNATION.PATIENT:
				user = await PatientRepo.getPatientById(userId);
				break;
			case DESIGNATION.ADMIN:
				user = await AdminRepo.getAdminById(userId);
				break;
			default:
				return response(StatusCodes.BAD_REQUEST, null, 'Invalid Designation');
		}

		if (!user) {
			return response(StatusCodes.NOT_FOUND, null, 'User not found');
		}

		return response(StatusCodes.OK, user, 'User Retrieved');
	};
}
