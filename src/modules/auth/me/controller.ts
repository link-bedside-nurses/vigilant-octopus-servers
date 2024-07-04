import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../interfaces';
import { AdminRepo } from '../../users/admins/repo';
import { CaregiverRepo } from '../../users/caregivers/repo';
import { PatientRepo } from '../../users/patients/repo';
import { response } from '../../../utils/http-response';

export function getCurrentUser() {
	return async function (request: HTTPRequest<object>) {
		const designation = request.account?.designation;
		const userId = request.account?.id;

		if (!userId) {
			return response(StatusCodes.UNAUTHORIZED, null, 'User not authenticated');
		}

		let user;
		switch (designation) {
			case DESIGNATION.NURSE:
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
