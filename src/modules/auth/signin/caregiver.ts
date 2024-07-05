import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';
import { CaregiverRepo } from '../../users/caregivers/repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

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

		const user = await CaregiverRepo.getCaregiverByPhone(phone);

		if (!user) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials');
		}

		const match = await argon2.verify(user.password, password, {
			type: argon2.argon2id,
		});

		if (!match) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials');
		}

		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return response(StatusCodes.OK, { user, accessToken }, 'Signed in');
	};
}
