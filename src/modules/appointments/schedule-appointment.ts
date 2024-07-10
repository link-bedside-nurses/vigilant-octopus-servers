import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { ScheduleAppointmentDto, ScheduleAppointmentSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function scheduleAppointment() {
	return async function (request: HTTPRequest<object, ScheduleAppointmentDto, object>) {
		const result = ScheduleAppointmentSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, result.error.issues[0].message);
		}

		const caregiver = await CaregiverRepo.getCaregiverById(result.data.caregiver);

		if (!caregiver) {
			return response(StatusCodes.BAD_REQUEST, null, `No such caregiver with given id`);
		}

		const patient = await PatientRepo.getPatientById(request.account?.id!);

		if (!patient) {
			return response(StatusCodes.BAD_REQUEST, null, `No such patient with given id`);
		}

		const appointment = await AppointmentRepo.scheduleAppointment(
			request.account?.id!,
			result.data
		);

		return response(StatusCodes.OK, appointment, 'Appointment Scheduled');
	};
}
