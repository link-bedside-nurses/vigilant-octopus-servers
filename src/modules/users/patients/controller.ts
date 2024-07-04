/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../utils/http-response';
import { PatientRepo } from './repo';
import { UpdatePatientDto } from '../../../interfaces/dtos';

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
