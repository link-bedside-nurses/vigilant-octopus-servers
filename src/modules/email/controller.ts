import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { ACCOUNT } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { AdminRepo } from '../../infra/database/repositories/admin-repository';
import { VerifyEmailDto, VerifyEmailSchema } from '../../core/interfaces/dtos';
import startEmailVerification from '../../core/utils/startEmailVerification';
import { getOTP } from '../../services/otp';
import mongoose from 'mongoose';

export function sendEmail() {
	return async function ( request: HTTPRequest<object, object, Pick<VerifyEmailDto, 'email'>> ) {
		const result = VerifyEmailSchema.omit( { otp: true } ).safeParse( request.query );

		console.log( 'result', result );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email } = request.query;

		console.log( 'email', email );

		try {
			await startEmailVerification( email );
			console.log( 'email sent successfully' );
			return response( StatusCodes.OK, null, 'Email sent successfully!' );
		} catch ( error ) {
			console.log( 'error', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error as unknown as Error,
				'Failed to send email'
			);
		}
	};
}

export function verifyEmail() {
	return async function ( request: HTTPRequest<object, object, VerifyEmailDto> ) {
		const result = VerifyEmailSchema.safeParse( request.query );
		console.log( 'result', result );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		try {
			console.log( 'result.data', result.data );
			const otp = await getOTP( result.data.email );
			console.log( 'otp', otp );
			if ( !otp ) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Wrong or Expired OTP. Try resending the OTP request'
				);
			}

			if ( otp === result.data.otp ) {
				const user = await AdminRepo.getAdminByEmail( result.data.email );

				console.log( 'user', user );

				if ( !user ) {
					return response(
						StatusCodes.NOT_FOUND,
						null,
						'No such user with given email. Please try registering again after 5 mins'
					);
				}

				user.isEmailVerified = true;
				await user.save();
				console.log( 'user saved successfully', user );
				const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );
				console.log( 'accessToken', accessToken );
				return response( StatusCodes.OK, { user, accessToken }, 'OTP has been Verified' );
			}
			console.log( 'wrong OTP' );
			return response( StatusCodes.BAD_REQUEST, null, 'Wrong OTP' );
		} catch ( error ) {
			console.log( 'error', error );
			return response( StatusCodes.INTERNAL_SERVER_ERROR, null, 'FAILED TO VERIFY OTP' );
		}
	};
}
