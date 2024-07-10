import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { Document } from 'mongoose';
import { ACCOUNT } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { AdminRepo } from '../../infra/database/repositories/admin-repository';
import { VerifyEmailDto, VerifyEmailSchema } from '../../core/interfaces/dtos';
import startEmailVerification from '../../core/utils/startEmailVerification';
import { getOTP } from '../../services/otp';
import logger from '../../core/utils/logger';

export function sendEmail() {
	return async function (request: HTTPRequest<object, object, Pick<VerifyEmailDto, 'email'>>) {
		const result = VerifyEmailSchema.omit({ otp: true }).safeParse(request.query);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
		}

		const { email } = request.query;

		try {
			await startEmailVerification(email);
			return response(StatusCodes.OK, null, 'Email sent successfully!');
		} catch (error) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error as unknown as Error,
				'Failed to send email'
			);
		}
	};
}

export function verifyEmail() {
	return async function (request: HTTPRequest<object, object, VerifyEmailDto>) {
		const result = VerifyEmailSchema.safeParse(request.query);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
		}

		try {
			const otp = await getOTP(result.data.email);

			if (!otp) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Wrong or Expired OTP. Try resending the OTP request'
				);
			}

			if (otp === result.data.otp) {
				const user = await AdminRepo.getAdminByEmail(result.data.email);

				if (!user) {
					return response(
						StatusCodes.NOT_FOUND,
						null,
						'No such user with given email. Please try registering again after 5 mins'
					);
				}

				user.isEmailVerified = true;
				await user.save();

				const accessToken = createAccessToken(user as Document & ACCOUNT);
				return response(StatusCodes.OK, { user, accessToken }, 'OTP has been Verified');
			}
			return response(StatusCodes.BAD_REQUEST, null, 'Wrong OTP');
		} catch (error) {
			logger.error(error);
			return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'FAILED TO VERIFY OTP');
		}
	};
}
