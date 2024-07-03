import { StatusCodes } from 'http-status-codes';
import * as argon2 from 'argon2';
import { HTTPRequest } from '../../../adapters/express-callback';
import { AdminRepo } from '../../users/admins/repo';

export function adminSignin() {
	return async function (request: HTTPRequest<object, { email: string; password: string }>) {
		const { email, password } = request.body;

		if (!email || !password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			};
		}

		const user = await AdminRepo.getAdminByEmail(email);

		if (!user) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Credentials',
					data: null,
				},
			};
		}

		const match = await argon2.verify(user.password, password, {
			type: argon2.argon2id,
		});

		if (!match) {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					data: null,
					message: 'Invalid Credentials',
				},
			};
		}
		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				message: 'Signed in',
			},
		};
	};
}
