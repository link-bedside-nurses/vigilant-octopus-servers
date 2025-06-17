import { HTTPRequest } from '../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { ACCOUNT } from '../../interfaces';
import { response } from '../../utils/http-response';
import { AdminRepo } from '../../database/repositories/admin-repository';
import { VerifyEmailDto, VerifyEmailSchema } from '../../interfaces/dtos';
import startEmailVerification from '../../utils/startEmailVerification';
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
						StatusCodes.OK,
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

export function getEmailVerificationOTP() {
	return async function ( request: HTTPRequest<object, object, VerifyEmailDto> ) {
		const result = VerifyEmailSchema.safeParse( request.query );
		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		await startEmailVerification( result.data.email );
		return response( StatusCodes.OK, null, 'Check email for OTP' );
	}
}
