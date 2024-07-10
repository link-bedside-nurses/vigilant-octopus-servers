import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function patientSignup() {
	return async function (request: HTTPRequest<object, CreatePatientDto>) {
		const result = CreatePatientSchema.safeParse(request.body);
		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
		}

		const patient = await PatientRepo.getPatientByPhone(result.data.phone);

		if (patient) {
			return response(StatusCodes.BAD_REQUEST, null, 'Phone number in use');
		}

		const user = await PatientRepo.createPatient(result.data);

		await startPhoneVerification(result.data.phone);

		return response(StatusCodes.OK, user, 'Account created');
	};
}
