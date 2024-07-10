import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function getAllAppointments() {
	return async function (_: HTTPRequest<object, object>) {
		const appointments = await AppointmentRepo.getAllAppointments();
		const message =
			appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved';

		return response(StatusCodes.OK, appointments, message);
	};
}
