import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function confirmAppointment() {
	return async function ( request: HTTPRequest<{ id: string }, object> ) {
		const appointment = await AppointmentRepo.getAppointmentById( request.params.id );
		console.log( 'appointment', appointment );
		if ( !appointment ) {
			return response( StatusCodes.NOT_FOUND, null, 'Could not confirm appointment.' );
		}

		await appointment.confirmAppointment();

		console.log( 'appointment confirmed successfully', appointment );

		return response( StatusCodes.OK, appointment, 'Appointment has been confirmed and initiated' );
	};
}
