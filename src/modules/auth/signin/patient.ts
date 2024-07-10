import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import { PatientRepo } from '../../../infrastructure/database/repositories/patient-repository';

export function patientSignin() {
	return async function (request: HTTPRequest<object, Pick<CreatePatientDto, 'phone'>>) {
		const result = CreatePatientSchema.pick({ phone: true }).safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
		}

		const user = await PatientRepo.getPatientByPhone(result.data.phone);

		if (!user) {
			return response(StatusCodes.UNAUTHORIZED, null, 'No such user found');
		}

		await startPhoneVerification(result.data.phone);

		return response(StatusCodes.OK, null, 'Check sms for Cne Time Code (OTP)');
	};
}
