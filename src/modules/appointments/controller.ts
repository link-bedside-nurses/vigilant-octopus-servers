/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';

import { AppointmentRepo } from './repo';
import { APPOINTMENT_STATUSES } from '../../interfaces';
import { CancelAppointmentDto, ScheduleAppointmentDto } from '../../interfaces/dtos';
import { CaregiverRepo } from '../users/caregivers/repo';

export function getAllAppointments() {
	return async function (_: HTTPRequest<object, object>) {
		const appointments = await AppointmentRepo.getAllAppointments();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointments,
				message:
					appointments.length === 0
						? 'No Appointments Scheduled'
						: 'All appointments retrieved',
				count: appointments.length,
			},
		};
	};
}

export function getCaregiverAppointments() {
	return async function (request: HTTPRequest<{ id: string }, object, object>) {
		const appointments = await AppointmentRepo.getCaregiverAppointments(request.params.id);

		if (appointments.length > 0) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: appointments,
					count: appointments.length,
					message: 'Successfully fetched caregiver Appointments',
				},
			};
		} else {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'No Appointment Found',
				},
			};
		}
	};
}

export function getPatientAppointments() {
	return async function (
		request: HTTPRequest<{ id: string }, object, { status: APPOINTMENT_STATUSES }>
	) {
		const { status } = request.query;

		const appointments = await AppointmentRepo.getPatientAppointments(
			request.params.id,
			status
		);

		if (appointments.length > 0) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: appointments,
					count: appointments.length,
					message: 'Successfully fetched patient Appointments',
				},
			};
		} else {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'No Appointment Found',
				},
			};
		}
	};
}

export function scheduleAppointment() {
	return async function (request: HTTPRequest<object, ScheduleAppointmentDto, object>) {
		if (!request.body.reason && !request.body.caregiverId) {
			const missingFields = [];

			if (!request.body.reason) {
				missingFields.push('reason');
			}
			if (!request.body.caregiverId) {
				missingFields.push('caregiverId');
			}

			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: `The following fields are missing: ${missingFields.join(', ')}`,
					data: null,
				},
			};
		}

		const caregiver = await CaregiverRepo.getCaregiverById(request.body.caregiverId);

		if (!caregiver) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: `No such caregiver with id ${request.body.caregiverId} found`,
					data: null,
				},
			};
		}

		const appointment = await AppointmentRepo.scheduleAppointment(
			request.account?.id!,
			request.body
		);
		await appointment.save();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment Scheduled',
			},
		};
	};
}

export function confirmAppointment() {
	return async function (request: HTTPRequest<{ id: string }, object>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);

		if (!appointment) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not confirm appointment.',
				},
			};
		}

		await appointment.confirmAppointment();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment has been confirmed and initiated',
			},
		};
	};
}

export function cancelAppointment() {
	return async function (request: HTTPRequest<{ id: string }, CancelAppointmentDto>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);

		if (!appointment) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not cancel appointment.',
				},
			};
		}

		await appointment.cancelAppointment(request.body.reason);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Successfully cancelled appointment',
			},
		};
	};
}

export function getAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.getAppointmentById(request.params.id);
		if (!appointment) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not fetch appointment.',
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Successfully fetched appointment',
			},
		};
	};
}

export function deleteAppointment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const appointment = await AppointmentRepo.deleteAppointment(request.params.id);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Successfully deleted appointment',
			},
		};
	};
}
