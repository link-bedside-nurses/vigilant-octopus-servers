import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../express-callback';
import { PatientRepo } from '../../../database/repositories/patient-repository';
import { response } from '../../../utils/http-response';
import { z } from 'zod';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import mongoose from 'mongoose';

const PatientSigninSchema = z.object( {
	type: z.enum( ['email', 'phone'] ),
	username: z.string(),
} );

export function patientSignin() {
	return async function ( request: HTTPRequest<object, z.infer<typeof PatientSigninSchema>> ) {
		const result = PatientSigninSchema.safeParse( request.body );

		if ( !result.success ) {
			console.log( 'validation failed at signin ', JSON.stringify( result.error.issues ) );
			console.log( 'result', JSON.stringify( result.error ) );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${JSON.stringify( result.error.issues )} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { type, username } = result.data;
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


		// Create access token
		const accessToken = createAccessToken( patient as mongoose.Document & ACCOUNT );

		return response(
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Signed in successfully'
		);
	};
}
