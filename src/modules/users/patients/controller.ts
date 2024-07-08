import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../utils/http-response';
import { PatientRepo } from './repository';
import { UpdatePatientDto } from '../../../interfaces/dtos';
import { APPOINTMENT_STATUSES } from '../../../interfaces';
import { AppointmentRepo } from '../../appointments/repository';

export function getAllPatients() {
	return async function (_: HTTPRequest<object>) {
		const patients = await PatientRepo.getAllPatients();
		return response(StatusCodes.OK, patients, 'Patients Retrieved');
	};
}

export function getPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const patient = await PatientRepo.getPatientById(request.params.id);
		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}
		return response(StatusCodes.OK, patient, 'Patient Retrieved');
	};
}

export function deletePatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const patient = await PatientRepo.deletePatient(request.params.id);

		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}
		return response(StatusCodes.OK, patient, 'Patient deleted');
	};
}

export function updatePatient() {
	return async function (request: HTTPRequest<{ id: string }, UpdatePatientDto>) {
		const patient = await PatientRepo.updatePatient(request.params.id, request.body);

		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}

		return response(StatusCodes.OK, patient, 'Patient updated');
	};
}

export function deactivatePatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const patient = await PatientRepo.deactivatePatient(request.params.id);

		if (!patient) {
			return response(StatusCodes.NOT_FOUND, null, 'No Patient Found');
		}

		return response(StatusCodes.OK, patient, 'Patient updated');
	};
}

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
