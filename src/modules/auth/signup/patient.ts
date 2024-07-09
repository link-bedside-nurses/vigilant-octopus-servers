import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';
import { PatientRepo } from '../../users/patients/repository';
import startPhoneVerification from '../../../utils/startPhoneVerification';

export function patientSignup() {
	return async function (request: HTTPRequest<object, CreatePatientDto>) {
		const result = CreatePatientSchema.safeParse(request.body);
		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation error', result.error);
		}

		const { phone } = result.data;

		const patient = await PatientRepo.getPatientByPhone(phone);

		if (patient) {
			return response(StatusCodes.BAD_REQUEST, null, 'Phone number in use');
		}

		const user = await PatientRepo.createPatient(result.data);

		await startPhoneVerification(result.data.phone);

		return response(StatusCodes.OK, user, 'Account created');
	};
}
