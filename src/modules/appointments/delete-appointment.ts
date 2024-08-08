import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function deleteAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.deleteAppointment(request.params.id);

		return response(StatusCodes.OK, appointment, 'Successfully deleted appointment');
	};
}
