import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { CancelAppointmentDto } from '../../interfaces/dtos';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function cancelAppointment() {
	return async function ( request: HTTPRequest<{ id: string }, CancelAppointmentDto> ) {
		const appointment = await AppointmentRepo.getAppointmentById( request.params.id );
		console.log( 'appointment', appointment );

		if ( !appointment ) {
			console.log( 'appointment not found' );
			return response( StatusCodes.OK, null, 'Could not cancel appointment.' );
		}

		await appointment.cancelAppointment( request.body.reason || 'NONE' );
		console.log( 'appointment cancelled successfully', appointment );

		return response( StatusCodes.OK, appointment, 'Successfully cancelled appointment' );
	};
}
