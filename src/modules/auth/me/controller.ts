import { HTTPRequest } from '../../../api/adapters/express-callback';

import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../core/interfaces';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function getCurrentUser() {
	return async function ( request: HTTPRequest<object> ) {
		const { designation, id: userId } = request.account!;

		console.log( 'userId', userId );
		if ( !userId ) {
			console.log( 'User not authenticated' );
			return response( StatusCodes.UNAUTHORIZED, null, 'User not authenticated' );
		}

		let user;
		switch ( designation ) {
			case DESIGNATION.CAREGIVER:
				user = await CaregiverRepo.getCaregiverById( userId );
				break;
			case DESIGNATION.PATIENT:
				user = await PatientRepo.getPatientById( userId );
				break;
			case DESIGNATION.ADMIN:
				user = await AdminRepo.getAdminById( userId );
				break;
			default:
				console.log( 'Invalid Designation' );
				return response( StatusCodes.BAD_REQUEST, null, 'Invalid Designation' );
		}
		console.log( 'user', user );
		if ( !user ) {
			console.log( 'User not found' );
			return response( StatusCodes.NOT_FOUND, null, 'User not found' );
		}
		console.log( 'User Retrieved' );
		return response( StatusCodes.OK, user, 'User Retrieved' );
	};
}
