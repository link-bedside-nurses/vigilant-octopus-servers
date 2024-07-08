import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import { AdminRepo } from '../../users/admins/repository';
import { CreateAdminDto, CreateAdminSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';
import startEmailVerification from '../../../utils/startEmailVerification';
import { Password } from '../../../utils/password';

export function adminSignup() {
	return async function (request: HTTPRequest<object, CreateAdminDto>) {
		const result = CreateAdminSchema.safeParse(request.body);
		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation failed', result.error);
		}

		const { email, password } = result.data;

		const admin = await AdminRepo.getAdminByEmail(email);

		if (admin) {
			return response(StatusCodes.BAD_REQUEST, null, 'Email already in use');
		}

		const hash = await Password.hash(password);

		const user = await AdminRepo.createAdmin({
			...result.data,
			password: hash,
		});

		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		await startEmailVerification(email);

		return response(StatusCodes.OK, { user, accessToken }, 'Account created');
	};
}
