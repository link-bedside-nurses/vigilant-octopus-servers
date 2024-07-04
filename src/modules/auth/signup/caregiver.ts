import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { db } from '../../../db';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import * as argon2 from 'argon2';
import { CaregiverRepo } from '../../users/caregivers/repo';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';

export function caregiverSignup() {
	return async function (request: HTTPRequest<object, CreateCaregiverDto>) {
		const result = CreateCaregiverSchema.safeParse(request.body);
		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation failed', result.error);
		}

		const { phone, password } = result.data;

		const caregiver = await db.caregivers.findOne({ phone });

		if (caregiver) {
			return response(StatusCodes.BAD_REQUEST, null, 'Phone number in use');
		}

		const hash = await argon2.hash(password, {
			type: argon2.argon2id,
		});

		const user = await CaregiverRepo.createCaregiver({
			...result.data,
			password: hash,
		});

		await user.save();
		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return response(StatusCodes.OK, { user, accessToken }, 'Account created');
	};
}
