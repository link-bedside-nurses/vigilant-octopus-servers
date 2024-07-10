import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { CreateAdminDto, CreateAdminSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startEmailVerification from '../../../core/utils/startEmailVerification';
import { Password } from '../../../core/utils/password';

export function adminSignup() {
	return async function (request: HTTPRequest<object, CreateAdminDto>) {
		const result = CreateAdminSchema.safeParse(request.body);
		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
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
