import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';
import { response } from '../../../core/utils/http-response';
import { z } from 'zod';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import startEmailVerification from '../../../core/utils/startEmailVerification';

const PatientSigninSchema = z.object( {
	type: z.enum( ['email', 'phone'] ),
	username: z.string(),
} );

export function patientSignin() {
	return async function ( request: HTTPRequest<object, z.infer<typeof PatientSigninSchema>> ) {
		const result = PatientSigninSchema.safeParse( request.body );

		console.log( 'imcoming data', request.body )
		if ( !result.success ) {
			console.log( 'validation failed at signin ', result.error )
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		console.log( 'result', result );

		const { type, username } = result.data;
		let patient;

		// Find patient based on type
		if ( type === 'email' ) {
			patient = await PatientRepo.getPatientByEmail( username );
		} else {
			patient = await PatientRepo.getPatientByPhone( username );
		}

		console.log( 'user', patient );

		if ( !patient ) {
			console.log( 'No such user found' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid credentials' );
		}

		// Send verification based on type
		if ( type === 'email' ) {
			await startEmailVerification( patient.email! );
			console.log( 'OTP sent successfully to email', patient.email );
			return response( StatusCodes.OK, null, 'Check email for One Time Code (OTP)' );
		} else {
			await startPhoneVerification( patient.phone );
			console.log( 'OTP sent successfully to phone number', patient.phone );
			return response( StatusCodes.OK, null, 'Check sms for One Time Code (OTP)' );
		}
	};
}
