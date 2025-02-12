import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';
import { response } from '../../../core/utils/http-response';
import { z } from 'zod';
import { Password } from '../../../core/utils/password';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import mongoose from 'mongoose';

const PatientSigninSchema = z.object( {
	type: z.enum( ['email', 'phone'] ),
	username: z.string(),
	password: z.string()
} );

export function patientSignin() {
	return async function ( request: HTTPRequest<object, z.infer<typeof PatientSigninSchema>> ) {
		const result = PatientSigninSchema.safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { type, username, password } = result.data;
		let patient;

		// Find patient based on type
		if ( type === 'email' ) {
			patient = await PatientRepo.getPatientByEmail( username );
		} else {
			patient = await PatientRepo.getPatientByPhone( username );
		}

		if ( !patient ) {
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid credentials' );
		}

		// Verify password
		const match = await Password.verify( patient.password, password );
		if ( !match ) {
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid credentials' );
		}

		// Create access token
		const accessToken = createAccessToken( patient as mongoose.Document & ACCOUNT );

		return response(
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Signed in successfully'
		);
	};
}
