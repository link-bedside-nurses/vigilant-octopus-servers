import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { UpdateAdminSchema, UpdateCaregiverDto } from '../../../core/interfaces/dtos';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function completeCaregiverProfile() {
	return async function ( request: HTTPRequest<object, UpdateCaregiverDto> ) {
		const result = UpdateAdminSchema.safeParse( request.body );

		if ( !result.success ) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		console.log( 'result', result );

		const updatedCaregiver = await CaregiverRepo.findByIdAndUpdate(
			request.account?.id!,
			request.body
		);
		console.log( 'updatedCaregiver successfully', updatedCaregiver );
		return response( StatusCodes.OK, updatedCaregiver, 'Profile updated' );
	};
}
