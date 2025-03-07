import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';
import { Password } from '../../../core/utils/password';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import startEmailVerification from '../../../core/utils/startEmailVerification';
import { createAccessToken } from '../../../services/token';
import { ACCOUNT } from '../../../core/interfaces';
import mongoose from 'mongoose';

export function patientSignup() {
	return async function ( request: HTTPRequest<object, CreatePatientDto> ) {
		let result = CreatePatientSchema.safeParse( request.body );
		if ( !request.body.email ) {
			result = CreatePatientSchema.omit( { email: true } ).safeParse( request.body );
		}

		console.log( 'result', result );

		if ( !result.success ) {
			console.log( 'Validation failed', result.error.issues );
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

		// Hash password
		const hash = await Password.hash( result.data.password );

		// Create patient with hashed password
		const patient = await PatientRepo.createPatient( {
			...result.data,
			password: hash
		} );

		// Generate access token
		const accessToken = createAccessToken( patient as mongoose.Document & ACCOUNT );

		// Send verification codes
		await startPhoneVerification( result.data.phone );
		if ( result.data.email ) {
			await startEmailVerification( result.data.email );
		}

		return response(
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Account created successfully'
		);
	};
}
