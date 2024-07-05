import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from './repository';
import { UpdateAdminDto } from '../../../interfaces/dtos';
import { PatientRepo } from '../patients/repository';
import { CaregiverRepo } from '../caregivers/repository';
import { response } from '../../../utils/http-response';

export function getAllAdmins() {
	return async function () {
		const admins = await AdminRepo.getAllAdmins();
		return response(StatusCodes.OK, admins, 'Admins Retrieved');
	};
}

export function getAdmin() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const admin = await AdminRepo.getAdminById(request.params.id);
		if (!admin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, admin, 'Admin Retrieved');
	};
}

export function banAdmin() {
	return async function (request: HTTPRequest<{ id: string }>) {
		if (request.account?.id === request.params.id) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'You cannot ban yourself, Please select a different admin to ban'
			);
		}
		const updatedAdmin = await AdminRepo.banAdmin(request.params.id);
		if (!updatedAdmin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, updatedAdmin, 'Admin banned');
	};
}

export function banCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const bannedCaregiver = await CaregiverRepo.banCaregiver(request.params.id);
		if (!bannedCaregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No such caregiver Found');
		}
		return response(
			StatusCodes.OK,
			bannedCaregiver,
			'Caregiver Successfully banned from using the application'
		);
	};
}

export function banPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const bannedPatient = await PatientRepo.banPatient(request.params.id);
		if (!bannedPatient) {
			return response(StatusCodes.NOT_FOUND, null, 'No such patient Found');
		}
		return response(
			StatusCodes.OK,
			bannedPatient,
			'Patient Successfully banned from using the application!'
		);
	};
}

export function verifyCaregiver() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const verifiedCaregiver = await CaregiverRepo.verifyCaregiver(request.params.id);
		if (!verifiedCaregiver) {
			return response(StatusCodes.NOT_FOUND, null, 'No such caregiver Found');
		}
		return response(StatusCodes.OK, verifiedCaregiver, 'Caregiver verified');
	};
}

export function verifyPatient() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const verifiedPatient = await PatientRepo.verifyPatient(request.params.id);
		if (!verifiedPatient) {
			return response(StatusCodes.NOT_FOUND, null, 'No such patient Found');
		}
		return response(StatusCodes.OK, verifiedPatient, 'Patient verified!');
	};
}

export function updateAdmin() {
	return async function (request: HTTPRequest<{ id: string }, UpdateAdminDto>) {
		const admin = await AdminRepo.updateAdmin(request.params.id, request.body);
		if (!admin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, admin, 'Admin updated');
	};
}
