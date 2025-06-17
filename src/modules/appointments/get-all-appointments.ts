import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function getAllAppointments() {
	return async function ( _: HTTPRequest<object, object> ) {
		const appointments = await AppointmentRepo.getAllAppointments();
		const message =
			appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved';

		console.log( 'appointments retrieved successfully' );

		return response( StatusCodes.OK, appointments, message );
	};
}
