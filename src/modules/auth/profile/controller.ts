import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { UpdateAdminSchema, UpdateNurseDto } from '../../../interfaces/dtos';
import { NurseRepo } from '../../../database/repositories/nurse-repository';
import { response } from '../../../utils/http-response';

export function completeNurseProfile() {
	return async function ( request: HTTPRequest<object, UpdateNurseDto> ) {
		const result = UpdateAdminSchema.safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		console.log( 'result', result );

		const updatedNurse = await NurseRepo.findByIdAndUpdate(
			request.account?.id!,
			request.body
		);
		console.log( 'updatedNurse successfully', updatedNurse );
		return response( StatusCodes.OK, updatedNurse, 'Profile updated' );
	};
}
