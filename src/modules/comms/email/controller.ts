import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../../services/token';
import { Document } from 'mongoose';
import { ACCOUNT } from '../../../interfaces';
import { response } from '../../../utils/http-response';
import { AdminRepo } from '../../users/admins/repository';
import { VerifyEmailDto, VerifyEmailSchema } from '../../../interfaces/dtos';
import startEmailVerification from '../../../utils/startEmailVerification';
import { getOTP } from '../../../services/otp';

export function sendEmail() {
	return async function (request: HTTPRequest<object, object, Pick<VerifyEmailDto, 'email'>>) {
		const result = VerifyEmailSchema.omit({ otp: true }).safeParse(request.query);

		if (!result.success) {
			const message = result.error.issues[0].message;
			return response(StatusCodes.BAD_REQUEST, null, message, result.error);
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
			const message = result.error.issues[0].message;
			return response(StatusCodes.BAD_REQUEST, null, message, result.error);
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
			console.log('error: ', error);
			return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'FAILED TO VERIFY OTP');
		}
	};
}
