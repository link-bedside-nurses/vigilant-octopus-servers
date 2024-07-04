import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { Document } from 'mongoose';
import { DESIGNATION, ACCOUNT } from '../../interfaces';
import { response } from '../../utils/http-response';
import { PatientRepo } from '../users/patients/repo';
import { CaregiverRepo } from '../users/caregivers/repo';

export function deleteAccount() {
	return async function (_: HTTPRequest<object, object, object>) {
		return response(StatusCodes.OK, null, 'account deleted');
	};
}

export function getAccessToken() {
	return async function (request: HTTPRequest<object, object, { designation: DESIGNATION }>) {
		const designation = request.query.designation;

		if (!designation) {
			return response(StatusCodes.BAD_REQUEST, null, 'Designation must be specified');
		}

		let user;
		if (designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientById(request.account?.id!);
		} else if (designation === DESIGNATION.NURSE || designation === DESIGNATION.ADMIN) {
			user = await CaregiverRepo.getCaregiverById(request.account?.id!);
		} else {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Designation');
		}

		if (!user) {
			return response(StatusCodes.BAD_REQUEST, null, 'No user found');
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return response(StatusCodes.OK, { accessToken }, 'Access token has been reset!');
	};
}
