import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { AdminRepo } from '../../users/admins/repository';
import { CreateAdminDto, CreateAdminSchema } from '../../../interfaces/dtos';
import { createAccessToken } from '../../../services/token';
import { response } from '../../../utils/http-response';
import { Password } from '../../../utils/password';

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

		const match = await Password.verify(user.password, password);

		if (!match) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials');
		}

		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return response(StatusCodes.OK, { user, accessToken }, 'Signed in');
	};
}
