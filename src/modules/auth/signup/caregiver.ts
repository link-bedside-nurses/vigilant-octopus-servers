import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';

export function caregiverSignup() {
	return async function (request: HTTPRequest<object, CreateCaregiverDto>) {
		const result = CreateCaregiverSchema.safeParse(request.body);
		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const caregiver = await CaregiverRepo.getCaregiverByPhone(result.data.phone);

		if (caregiver) {
			return response(StatusCodes.BAD_REQUEST, null, 'Phone number in use');
		}

		const hash = await Password.hash(result.data.password);

		const user = await CaregiverRepo.createCaregiver({
			...result.data,
			password: hash,
		});
		// @ts-ignore
		const accessToken = createAccessToken(user as Document & ACCOUNT);
		await startPhoneVerification(result.data.phone);
		return response(StatusCodes.OK, { user, accessToken }, 'Account created');
	};
}
