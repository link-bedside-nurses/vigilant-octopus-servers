import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';
import { Password } from '../../../core/utils/password';

export function patientSignup() {
	return async function ( request: HTTPRequest<object, CreatePatientDto> ) {
		const result = CreatePatientSchema.safeParse( request.body );

		console.log( 'result', result );

		if ( !result.success ) {
			console.log( 'Validation failed' );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		// Check if phone exists
		const existingPhone = await PatientRepo.getPatientByPhone( result.data.phone );
		if ( existingPhone ) {
			console.log( 'Phone number already in use ', result.data.phone );
			return response( StatusCodes.BAD_REQUEST, null, 'Phone number in use' );
		}

		// Check if email exists (if provided)
		if ( result.data.email ) {
			const existingEmail = await PatientRepo.getPatientByEmail( result.data.email );
			if ( existingEmail ) {
				console.log( 'Email already in use', result.data.email );
				return response( StatusCodes.BAD_REQUEST, null, 'Email already in use' );
			}
		}

		// Hash password if it exists in the schema
		if ( 'password' in result.data ) {
			result.data.password = await Password.hash( result.data.password );
		}

		const user = await PatientRepo.createPatient( result.data );

		console.log( 'user created successfully', user );

		await startPhoneVerification( result.data.phone );
		console.log( 'OTP sent successfully to phone number', result.data.phone );

		return response( StatusCodes.OK, user, 'Account created' );
	};
}
