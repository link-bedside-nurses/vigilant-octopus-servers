/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';

import { AppointmentRepo } from './repo';
import { APPOINTMENT_STATUSES } from '../../interfaces';
import {
	CancelAppointmentDto,
	ScheduleAppointmentDto,
	ScheduleAppointmentSchema,
} from '../../interfaces/dtos';
import { CaregiverRepo } from '../users/caregivers/repo';
import { response } from '../../utils/http-response';

export function getAllAppointments() {
	return async function (_: HTTPRequest<object, object>) {
		const appointments = await AppointmentRepo.getAllAppointments();
		const message =
			appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved';

		return response(StatusCodes.OK, { data: appointments, count: appointments.length }, message);
	};
}

export function getCaregiverAppointments() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const appointments = await AppointmentRepo.getCaregiverAppointments(request.params.id);
		const message =
			appointments.length > 0
				? 'Successfully fetched caregiver Appointments'
				: 'No Appointment Found';

		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.NOT_FOUND,
			{ data: appointments.length > 0 ? appointments : null, count: appointments.length },
			message
		);
	};
}

export function getPatientAppointments() {
	return async function (
		request: HTTPRequest<{ id: string }, object, { status: APPOINTMENT_STATUSES }>
	) {
		const { status } = request.query;

		const appointments = await AppointmentRepo.getPatientAppointments(request.params.id, status);
		const message =
			appointments.length > 0
				? 'Successfully fetched patient Appointments'
				: 'No Appointment Found';

		return response(
			appointments.length > 0 ? StatusCodes.OK : StatusCodes.NOT_FOUND,
			{ data: appointments.length > 0 ? appointments : null, count: appointments.length },
			message
		);
	};
}

export function scheduleAppointment() {
	return async function (request: HTTPRequest<object, ScheduleAppointmentDto, object>) {
		const result = ScheduleAppointmentSchema.safeParse(request.body);

		if (!result.success) {
			return response(StatusCodes.BAD_REQUEST, null, 'Validation Error', result.error);
		}

		const caregiver = await CaregiverRepo.getCaregiverById(request.body.caregiverId);

		if (!caregiver) {
			return response(StatusCodes.BAD_REQUEST, null, `No such caregiver with given id`);
		}

		const appointment = await AppointmentRepo.scheduleAppointment(
			request.account?.id!,
			request.body
		);
		await appointment.save();

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
