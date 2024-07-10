import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infrastructure/database/repositories/appointment-repository';
import { CancelAppointmentDto } from '../../core/interfaces/dtos';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function cancelAppointment() {
	return async function (request: HTTPRequest<{ id: string }, CancelAppointmentDto>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);

		if (!appointment) {
			return response(StatusCodes.NOT_FOUND, null, 'Could not cancel appointment.');
		}

		await appointment.cancelAppointment(request.body.reason);

		return response(StatusCodes.OK, appointment, 'Successfully cancelled appointment');
	};
}
