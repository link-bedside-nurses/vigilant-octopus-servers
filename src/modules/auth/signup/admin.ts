import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { db } from '../../../db';
import { DESIGNATION, ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';
import { AdminRepo } from '../../users/admins/repo';
import { CreateAdminDto } from '../../../interfaces/dtos';

export function adminSignup() {
	return async function (request: HTTPRequest<object, CreateAdminDto>) {
		const { email, password, firstName, lastName } = request.body;

		if (!email || !password || !firstName || !lastName) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			};
		}

		const user = await db.admins.findOne({ email });

		if (user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'email in use',
					data: null,
				},
			};
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		});
		const newUser = await AdminRepo.createAdmin({
			designation: DESIGNATION.ADMIN,
			email,
			firstName,
			lastName,
			password: hash,
			phone: '',
		});

		await newUser.save();
		// @ts-ignore
		const token = createAccessToken(newUser as unknown as Document & ACCOUNT);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: newUser,
				token,
				message: 'Account created',
			},
		};
	};
}
