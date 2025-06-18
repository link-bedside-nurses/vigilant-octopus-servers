import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../express-callback';
import { ACCOUNT } from '../../../interfaces';
import { createAccessToken } from '../../../services/token';
import { NurseRepo } from '../../../database/repositories/nurse-repository';
import { CreateNurseDto, CreateNurseSchema } from '../../../interfaces/dtos';
import { response } from '../../../utils/http-response';
import { Password } from '../../../utils/password';
import startPhoneVerification from '../../../utils/startPhoneVerification';
import mongoose from 'mongoose';
import startEmailVerification from '../../../utils/startEmailVerification';

export function nurseSignup() {
	return async function ( request: HTTPRequest<object, CreateNurseDto> ) {
		const result = CreateNurseSchema.safeParse( request.body );

		console.log( 'result', result );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		console.log( 'result.data', result.data );

		const nurse = await NurseRepo.getNurseByPhone( result.data.phone );

		if ( nurse ) {
			console.log( 'Phone number already in use ', result.data.phone );
			return response( StatusCodes.BAD_REQUEST, null, 'Phone number in use' );
		}

		const email = await NurseRepo.getNurseByEmail( result.data.email );

		if ( email ) {
			console.log( 'Email already in use ', result.data.email );
			return response( StatusCodes.BAD_REQUEST, null, 'Email in use' );
		}

		const hash = await Password.hash( result.data.password );

		console.log( 'password hashed successfully', hash );

		const user = await NurseRepo.createNurse( {
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
