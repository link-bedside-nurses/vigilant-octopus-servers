import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../database/repositories/caregiver-repository';
import { response } from '../../../utils/http-response';

export function getAllCaregivers() {
	return async function ( request: HTTPRequest<object, object, { latLng: string }> ) {
		console.log( 'calling getAllCaregivers' );
		console.log( 'request.account?.id', request.account?.id );
		const { latLng } = request.query;
		console.log( 'latLng', latLng );

		let caregivers = [];
		if ( latLng ) {
			console.log( 'latLng', latLng );
			caregivers = await CaregiverRepo.getAllCaregiversByCoords( latLng );
		} else {
			console.log( 'no latLng' );
			caregivers = await CaregiverRepo.getAllCaregivers();
		}
		console.log( 'caregivers', caregivers );

		return response( StatusCodes.OK, caregivers, 'Caregivers Retrieved' );
	};
}
