import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';

export function caregiverSignin() {
	return async function (
		request: HTTPRequest<object, Pick<CreateCaregiverDto, 'phone' | 'password'>>
	) {
		const result = CreateCaregiverSchema.pick({ phone: true, password: true }).safeParse(
			request.body
		);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
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
