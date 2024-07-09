import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { PatientRepo } from '../../users/patients/repository';
import { CreatePatientDto, CreatePatientSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';
import startPhoneVerification from '../../../utils/startPhoneVerification';

export function patientSignin() {
	return async function (request: HTTPRequest<object, Pick<CreatePatientDto, 'phone'>>) {
		const result = CreatePatientSchema.pick({ phone: true }).safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation error', result.error);
		}

		const user = await PatientRepo.getPatientByPhone(result.data.phone);

		if (!user) {
			return response(StatusCodes.UNAUTHORIZED, null, 'No such user found');
		}

		await startPhoneVerification(result.data.phone);

		return response(StatusCodes.OK, null, 'Check sms for Cne Time Code (OTP)');
	};
}
