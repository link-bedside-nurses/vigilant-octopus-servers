import { HTTPRequest } from '../../../express-callback';

import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../../interfaces';
import { AdminRepo } from '../../../database/repositories/admin-repository';
import { CaregiverRepo } from '../../../database/repositories/caregiver-repository';
import { response } from '../../../utils/http-response';
import { PatientRepo } from '../../../database/repositories/patient-repository';

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
			return response( StatusCodes.OK, null, 'User not found' );
		}
		console.log( 'User Retrieved' );
		return response( StatusCodes.OK, user, 'User Retrieved' );
	};
}
