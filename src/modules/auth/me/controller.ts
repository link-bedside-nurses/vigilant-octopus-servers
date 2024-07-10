import { HTTPRequest } from '../../../api/adapters/express-callback';

import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../core/interfaces';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

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
