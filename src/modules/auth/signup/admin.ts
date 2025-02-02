import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { CreateAdminDto, CreateAdminSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startEmailVerification from '../../../core/utils/startEmailVerification';
import { Password } from '../../../core/utils/password';
import mongoose from 'mongoose';

export function adminSignup() {
	return async function ( request: HTTPRequest<object, CreateAdminDto> ) {
		const result = CreateAdminSchema.safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		console.log( 'result', result );

		const { email, password } = result.data;

		const admin = await AdminRepo.getAdminByEmail( email );

		console.log( 'admin', admin );

		if ( admin ) {
			console.log( 'Email already in use' );
			return response( StatusCodes.BAD_REQUEST, null, 'Email already in use' );
		}

		const hash = await Password.hash( password );

		console.log( 'password hashed successfully', hash );

		const user = await AdminRepo.createAdmin( {
			...result.data,
			password: hash,
		} );

		console.log( 'user created successfully', user );

		const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );

		console.log( 'accessToken created successfully', accessToken );

		await startEmailVerification( email );
		console.log( 'Email verification started to ', email );

		return response( StatusCodes.OK, { user, accessToken }, 'Account created' );
	};
}
