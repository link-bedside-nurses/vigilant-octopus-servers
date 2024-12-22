import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { CreateAdminDto, CreateAdminSchema } from '../../../core/interfaces/dtos';
import { createAccessToken } from '../../../services/token';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import mongoose from 'mongoose';
import { ACCOUNT } from '../../../core/interfaces';

export function adminSignin() {
	return async function ( request: HTTPRequest<object, Pick<CreateAdminDto, 'email' | 'password'>> ) {
		const result = CreateAdminSchema.pick( { email: true, password: true } ).safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		console.log( 'result', result );

		const { email, password } = result.data;

		const user = await AdminRepo.getAdminByEmail( email );

		console.log( 'user', user );

		if ( !user ) {
			console.log( 'Invalid Credentials' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials' );
		}

		const match = await Password.verify( user.password, password );

		console.log( 'match', match );

		if ( !match ) {
			console.log( 'Invalid Credentials' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid Credentials' );
		}

		const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );

		console.log( 'accessToken', accessToken );

		return response( StatusCodes.OK, { user, accessToken }, 'Signed in' );
	};
}
