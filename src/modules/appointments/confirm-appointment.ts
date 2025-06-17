import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function confirmAppointment() {
	return async function ( request: HTTPRequest<{ id: string }, object> ) {
		const appointment = await AppointmentRepo.getAppointmentById( request.params.id );
		console.log( 'appointment', appointment );
		if ( !appointment ) {
			return response( StatusCodes.OK, null, 'Could not confirm appointment.' );
		}

		await appointment.confirmAppointment();

		console.log( 'appointment confirmed successfully', appointment );

		return response( StatusCodes.OK, appointment, 'Appointment has been confirmed and initiated' );
	};
}
