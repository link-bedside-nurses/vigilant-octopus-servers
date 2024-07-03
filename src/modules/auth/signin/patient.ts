import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { PatientRepo } from '../../users/patients/repo';
import { CreatePatientDto } from '../../../interfaces/dtos';

export function patientSignin() {
	return async function (request: HTTPRequest<object, Pick<CreatePatientDto, 'phone'>>) {
		const { phone } = request.body;

		if (!request.body.phone) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone must be specified!',
					data: null,
				},
			};
		}

		const user = await PatientRepo.getPatientByPhone(phone);

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'No such user found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: null,
				message: 'Success',
			},
		};
	};
}
