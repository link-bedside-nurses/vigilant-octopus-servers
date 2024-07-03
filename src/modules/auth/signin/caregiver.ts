import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';
import { CaregiverRepo } from '../../users/caregivers/repo';
import { CreateCaregiverDto } from '../../../interfaces/dtos';

export function caregiverSignin() {
	return async function (
		request: HTTPRequest<
			object,
			Pick<CreateCaregiverDto, 'phone'> & Pick<CreateCaregiverDto, 'password'>
		>
	) {
		const { phone, password } = request.body;

		if (!phone || !password) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Some fields are missing',
					data: null,
				},
			};
		}

		const user = await CaregiverRepo.getCaregiverByPhone(phone);

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
