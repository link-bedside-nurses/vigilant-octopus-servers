import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../../infrastructure/database/repositories/appointment-repository';
import { response } from '../../../core/utils/http-response';

export function getCaregiverAppointments() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const appointments = await AppointmentRepo.getCaregiverAppointments(request.params.id);
		const message =
			appointments.length > 0
				? 'Successfully fetched caregiver Appointments'
				: 'No Appointment Found';

		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.NOT_FOUND,
			appointments,
			message
		);
	};
}
