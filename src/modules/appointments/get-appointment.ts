import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function getAppointment() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const appointment = await AppointmentRepo.getAppointmentById( request.params.id );
		if ( !appointment ) {
			return response( StatusCodes.OK, null, 'Could not fetch appointment.' );
		}

		console.log( 'appointment fetched successfully', appointment );

		return response( StatusCodes.OK, appointment, 'Successfully fetched appointment' );
	};
}
