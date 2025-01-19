import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';
import mongoose from 'mongoose';
import { z } from 'zod';

const CaregiverSigninSchema = z.object( {
	type: z.enum( ['email', 'phone'] ),
	username: z.string(),
	password: z.string()
} );

export function caregiverSignin() {
	return async function (
		request: HTTPRequest<object, z.infer<typeof CaregiverSigninSchema>>
	) {
		const result = CaregiverSigninSchema.safeParse( request.body );

		console.log( 'result', result );

		if ( !result.success ) {
			console.log( 'result.error', result.error );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { type, username, password } = result.data;
		console.log( 'username', username );

		let caregiver;

		// Find caregiver based on type
		if ( type === 'email' ) {
			caregiver = await CaregiverRepo.getCaregiverByEmail( username );
		} else {
			caregiver = await CaregiverRepo.getCaregiverByPhone( username );
		}

		console.log( 'caregiver', caregiver );

		if ( !caregiver ) {
			console.log( 'Invalid Credentials' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials' );
		}

		const match = await Password.verify( caregiver.password, password );

		console.log( 'match', match );

		if ( !match ) {
			console.log( 'Invalid Credentials' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials' );
		}

		const accessToken = createAccessToken( caregiver as mongoose.Document & ACCOUNT );

		console.log( 'accessToken', accessToken );

		return response( StatusCodes.OK, { user: caregiver, accessToken }, 'Signed in' );
	};
}
