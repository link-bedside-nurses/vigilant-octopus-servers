import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { DESIGNATION, ACCOUNT } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { getOTP } from '../../services/otp';
import { VerifyPhoneDto, VerifyPhoneSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import mongoose from 'mongoose';

export function verifyOTPFromPhone() {
	return async function ( request: HTTPRequest<object, object, VerifyPhoneDto> ) {
		const result = VerifyPhoneSchema.safeParse( request.query );
		console.log( 'calling verifyOTPFromPhone' );
		if ( !result.success ) {
			console.log( 'Validation failed' );
			return response(
				StatusCodes.OK,
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
			console.log( 'Getting caregiver by phone', result.data.phone );
			user = await CaregiverRepo.getCaregiverByPhone( result.data.phone );
		} else if ( result.data.designation === DESIGNATION.PATIENT ) {
			console.log( 'Getting patient by phone', result.data.phone );
			user = await PatientRepo.getPatientByPhone( result.data.phone );
		}

		if ( !user ) {
			console.log( 'User not found' );
			return response( StatusCodes.NOT_FOUND, null, 'User not found' );
		}

		const storedOTP = await getOTP( result.data.phone );

		if ( storedOTP && storedOTP !== result.data.otp ) {
			console.log( 'Wrong or Expired OTP. Try resending the OTP request' );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'Wrong or Expired OTP. Try resending the OTP request'
			);
		}

		user.isPhoneVerified = true;
		user = await user.save();

		console.log( 'User saved successfully', user );

		const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );

		console.log( 'accessToken created successfully', accessToken );

		return response( StatusCodes.OK, { user, accessToken }, 'OTP has been Verified' );
	};
}
