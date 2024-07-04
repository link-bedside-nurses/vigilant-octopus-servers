import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { PatientRepo } from '../../users/patients/repo';
import { CreatePatientDto, CreatePatientSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

export function patientSignin() {
	return async function (request: HTTPRequest<object, Pick<CreatePatientDto, 'phone'>>) {
		const result = CreatePatientSchema.pick({ phone: true }).safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation error', result.error);
		}

		const { phone } = result.data;

		const user = await PatientRepo.getPatientByPhone(phone);

		if (!user) {
			return response(StatusCodes.UNAUTHORIZED, null, 'No such user found');
		}

		return response(StatusCodes.OK, null, 'Success');
	};
}
