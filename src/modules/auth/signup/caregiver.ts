import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { db } from '../../../db';
import { DESIGNATION, ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';

interface SignUpBody {
	phone: string;
	name: string;
	password: string;
	email: string;
}

export function caregiverSignup() {
	return async function (request: HTTPRequest<object, SignUpBody>) {
		const { phone, password, name } = request.body;

		if (!phone || !password || !name) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			};
		}

		const caregiver = await db.caregivers.findOne({ phone });

		if (caregiver) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			};
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		});
		const user = await db.caregivers.create({
			phone,
			name,
			designation: DESIGNATION.NURSE,
			password: hash,
		});

		await user.save();
		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				accessToken,
				message: 'Account created',
			},
		};
	};
}
