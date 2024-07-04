import { StatusCodes } from 'http-status-codes';
import * as argon2 from 'argon2';
import { HTTPRequest } from '../../../adapters/express-callback';
import { AdminRepo } from '../../users/admins/repo';
import { CreateAdminDto, CreateAdminSchema } from '../../../interfaces/dtos';
import { createAccessToken } from '../../../services/token';
import { response } from '../../../utils/http-response';

export function adminSignin() {
	return async function (request: HTTPRequest<object, Pick<CreateAdminDto, 'email' | 'password'>>) {
		const result = CreateAdminSchema.pick({ email: true, password: true }).safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation error', result.error);
		}

		const { email, password } = result.data;

		const user = await AdminRepo.getAdminByEmail(email);

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
