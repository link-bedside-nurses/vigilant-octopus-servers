import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';

import { AppointmentRepo } from './repository';
import {
	CancelAppointmentDto,
	ScheduleAppointmentDto,
	ScheduleAppointmentSchema,
} from '../../interfaces/dtos';
import { CaregiverRepo } from '../users/caregivers/repository';
import { response } from '../../utils/http-response';
import { PatientRepo } from '../users/patients/repository';

export function getAllAppointments() {
	return async function (_: HTTPRequest<object, object>) {
		const appointments = await AppointmentRepo.getAllAppointments();
		const message =
			appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved';

		return response(StatusCodes.OK, appointments, message);
	};
}

export function scheduleAppointment() {
	return async function (request: HTTPRequest<object, ScheduleAppointmentDto, object>) {
		const result = ScheduleAppointmentSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation Error', result.error);
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

export function confirmAppointment() {
	return async function (request: HTTPRequest<{ id: string }, object>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);

		if (!appointment) {
			return response(StatusCodes.NOT_FOUND, null, 'Could not confirm appointment.');
		}

		await appointment.confirmAppointment();

		return response(StatusCodes.OK, appointment, 'Appointment has been confirmed and initiated');
	};
}

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

export function getAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);
		if (!appointment) {
			return response(StatusCodes.NOT_FOUND, null, 'Could not fetch appointment.');
		}

		return response(StatusCodes.OK, appointment, 'Successfully fetched appointment');
	};
}

export function deleteAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.deleteAppointment(request.params.id);

		return response(StatusCodes.OK, appointment, 'Successfully deleted appointment');
	};
}
