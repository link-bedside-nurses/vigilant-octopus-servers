import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';
import { AdminRepo } from '../../users/admins/repo';
import { CreateAdminDto, CreateAdminSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

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

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		});

		const newUser = await AdminRepo.createAdmin({
			...result.data,
			password: hash,
		});

		await newUser.save();

		// @ts-ignore
		const token = createAccessToken(newUser as Document & ACCOUNT);

		return response(StatusCodes.OK, { user: newUser, token }, 'Account created');
	};
}
