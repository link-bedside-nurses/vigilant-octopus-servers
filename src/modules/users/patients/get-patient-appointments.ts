import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../core/utils/http-response';
import { APPOINTMENT_STATUSES } from '../../../core/interfaces';
import { AppointmentRepo } from '../../../infrastructure/database/repositories/appointment-repository';

export function getPatientAppointments() {
	return async function (
		request: HTTPRequest<{ id: string }, object, { status?: APPOINTMENT_STATUSES }>
	) {
		const { status } = request.query;

		const appointments = await AppointmentRepo.getPatientAppointments(request.params.id, status);
		const message =
			appointments.length > 0
				? 'Successfully fetched patient Appointments'
				: 'No Appointment Found';

		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.NOT_FOUND,
			appointments,
			message
		);
	};
}
