import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../users/caregivers/repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';
import { Password } from '../../../utils/password';

export function caregiverSignin() {
	return async function (
		request: HTTPRequest<object, Pick<CreateCaregiverDto, 'phone' | 'password'>>
	) {
		const result = CreateCaregiverSchema.pick({ phone: true, password: true }).safeParse(
			request.body
		);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation error', result.error);
		}

		const { phone, password } = result.data;

		const caregiver = await CaregiverRepo.getCaregiverByPhone(phone);

		if (!caregiver) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials');
		}

		const match = await Password.verify(caregiver.password, password);

		if (!match) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials');
		}

		// @ts-ignore
		const accessToken = createAccessToken(caregiver as Document & ACCOUNT);

		return response(StatusCodes.OK, { user: caregiver, accessToken }, 'Signed in');
	};
}
