import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function deleteAppointment() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const appointment = await AppointmentRepo.deleteAppointment( request.params.id );
		console.log( 'appointment deleted successfully', appointment );
		return response( StatusCodes.OK, appointment, 'Successfully deleted appointment' );
	};
}
