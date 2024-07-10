import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function getAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);
		if (!appointment) {
			return response(StatusCodes.NOT_FOUND, null, 'Could not fetch appointment.');
		}

		return response(StatusCodes.OK, appointment, 'Successfully fetched appointment');
	};
}
