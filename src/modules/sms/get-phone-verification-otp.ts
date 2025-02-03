import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { generateOTP, storeOTP } from '../../services/otp';
import sendOTP from '../../infra/external-services/sms/sms';
import { PhoneVerifcationOTPDto, PhoneVerifcationOTPSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import logger from '../../core/utils/logger';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';

export function getPhoneVerificationOTP() {
	return async function ( request: HTTPRequest<object, object, PhoneVerifcationOTPDto> ) {
		const result = PhoneVerifcationOTPSchema.safeParse( request.query );

		if ( !result.success ) {
			console.log( 'Validation failed' );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		console.log( 'result.data', result.data );

		if (
			![DESIGNATION.CAREGIVER, DESIGNATION.PATIENT].includes( result.data.designation as DESIGNATION )
		) {
			console.log( 'Only patients or caregivers can access this route' );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'Only patients or caregivers can access this route'
			);
		}

		let user;
		if ( result.data.designation === DESIGNATION.CAREGIVER ) {
			console.log( 'Getting caregiver by phone', result.data.toPhone );
			user = await CaregiverRepo.getCaregiverByPhone( result.data.toPhone );
		} else if ( result.data.designation === DESIGNATION.PATIENT ) {
			console.log( 'Getting patient by phone', result.data.toPhone );
			user = await PatientRepo.getPatientByPhone( result.data.toPhone );
		}

		if ( !user ) {
			console.log( 'User not found' );
			return response( StatusCodes.OK, null, 'User not found' );
		}

		const otp = generateOTP();

		console.log( 'OTP generated successfully', otp );

		await storeOTP( result.data.toPhone, otp );

		console.log( 'OTP stored successfully' );

		logger.info( `OTP Expiring for phone: ${result.data.toPhone} in  2 minutes from now` );

		const otpResponse = await sendOTP( result.data.toPhone, otp );

		console.log( 'OTP sent successfully to phone number', result.data.toPhone );

		return response(
			StatusCodes.OK,
			JSON.parse( otpResponse.config.data ),
			'OTP generated successfully!'
		);
	};
}
