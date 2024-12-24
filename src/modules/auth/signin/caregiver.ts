import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { ACCOUNT } from '../../../core/interfaces';
import { createAccessToken } from '../../../services/token';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { CreateCaregiverDto, CreateCaregiverSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import { Password } from '../../../core/utils/password';
import mongoose from 'mongoose';

export function caregiverSignin() {
	return async function (
		request: HTTPRequest<object, Pick<CreateCaregiverDto, 'phone' | 'password'>>
	) {
		const result = CreateCaregiverSchema.pick( { phone: true, password: true } ).safeParse(
			request.body
		);

		console.log( 'result', result );

		if ( !result.success ) {
			console.log( 'result.error', result.error );
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { phone, password } = result.data;
		console.log( 'phone', phone );

		const caregiver = await CaregiverRepo.getCaregiverByPhone( phone );

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
