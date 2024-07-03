import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../interfaces';
import { AdminRepo } from '../../users/admins/repo';
import { CaregiverRepo } from '../../users/caregivers/repo';
import { PatientRepo } from '../../users/patients/repo';

export function getCurrentUser() {
	return async function (request: HTTPRequest<object>) {
		const designation = request.account?.designation;

		let user;
		if (designation === DESIGNATION.NURSE) {
			user = await CaregiverRepo.getCaregiverById(request.account?.id!);
		} else if (designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientById(request.account?.id!);
		} else if (designation === DESIGNATION.ADMIN) {
			user = await AdminRepo.getAdminById(request.account?.id!);
		} else {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Invalid Designation',
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				message: 'User Retrieved',
			},
		};
	};
}
