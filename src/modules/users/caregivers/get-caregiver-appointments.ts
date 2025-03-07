import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../../infra/database/repositories/appointment-repository';
import { response } from '../../../core/utils/http-response';

export function getCaregiverAppointments() {
	return async function ( request: HTTPRequest<{ id: string }, object, object> ) {
		console.log( 'calling getCaregiverAppointments' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const appointments = await AppointmentRepo.getCaregiverAppointments( request.params.id );
		console.log( 'appointments', appointments );
		const message =
			appointments.length > 0
				? 'Successfully fetched caregiver Appointments'
				: 'No Appointment Found';
		console.log( 'message', message );
		console.log( 'appointments.length', appointments.length );
		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.OK,
			appointments,
			message
		);
	};
}
