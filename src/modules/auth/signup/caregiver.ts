import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import mongoose from 'mongoose';
import startEmailVerification from '../../../core/utils/startEmailVerification';

export function caregiverSignup() {
	return async function ( request: HTTPRequest<object, CreateCaregiverDto> ) {
		const result = CreateCaregiverSchema.safeParse( request.body );

		console.log( 'result', result );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		console.log( 'result.data', result.data );

		const caregiver = await CaregiverRepo.getCaregiverByPhone( result.data.phone );

		if ( caregiver ) {
			console.log( 'Phone number already in use ', result.data.phone );
			return response( StatusCodes.BAD_REQUEST, null, 'Phone number in use' );
		}

		const email = await CaregiverRepo.getCaregiverByEmail( result.data.email );

		if ( email ) {
			console.log( 'Email already in use ', result.data.email );
			return response( StatusCodes.BAD_REQUEST, null, 'Email in use' );
		}

		const hash = await Password.hash( result.data.password );

		console.log( 'password hashed successfully', hash );

		const user = await CaregiverRepo.createCaregiver( {
			...result.data,
			password: hash,
		} );

		console.log( 'user created successfully', user );

		const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );

		console.log( 'accessToken created successfully', accessToken );

		await startPhoneVerification( result.data.phone );
		console.log( 'OTP sent successfully to phone number', result.data.phone );

		await startEmailVerification( result.data.email );
		console.log( 'OTP sent successfully to email', result.data.email );

		return response( StatusCodes.OK, { user, accessToken }, 'Account created' );
	};
}
