import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { DESIGNATION, ACCOUNT } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import mongoose from 'mongoose';

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
		} else if (designation === DESIGNATION.CAREGIVER || designation === DESIGNATION.ADMIN) {
			user = await CaregiverRepo.getCaregiverById(request.account?.id!);
		} else {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Designation');
		}

		if (!user) {
			return response(StatusCodes.BAD_REQUEST, null, 'No user found');
		}

		const accessToken = createAccessToken(user as mongoose.Document & ACCOUNT);

		return response(StatusCodes.OK, { accessToken }, 'Access token has been reset!');
	};
}
