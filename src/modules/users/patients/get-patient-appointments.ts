import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { APPOINTMENT_STATUSES } from '../../../core/interfaces';
import { AppointmentRepo } from '../../../infra/database/repositories/appointment-repository';

export function getPatientAppointments() {
	return async function (
		request: HTTPRequest<{ id: string }, object, { status?: APPOINTMENT_STATUSES }>
	) {
		console.log( 'calling getPatientAppointments' );
		console.log( 'request.params.id', request.params.id );
		const { status } = request.query;
		console.log( 'status', status );
		const appointments = await AppointmentRepo.getPatientAppointments(
			request.params.id,
			status
		);
		console.log( 'appointments', appointments );
		const message =
			appointments.length > 0
				? 'Successfully fetched patient Appointments'
				: 'No Appointment Found';
		console.log( 'message', message );
		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.OK,
			appointments,
			message
		);
	};
}
