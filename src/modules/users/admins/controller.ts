/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from './repo';
import { UpdateAdminDto } from '../../../interfaces/dtos';
import { PatientRepo } from '../patients/repo';
import { CaregiverRepo } from '../caregivers/repo';

export function getAllAdmins() {
	return async function () {
		const admins = await AdminRepo.getAllAdmins();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: admins,
				message: 'Admins Retrieved',
			},
		};
	};
}

export function getAdmin() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const admin = await AdminRepo.getAdminById(request.params.id);

		if (!admin) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: admin,
				message: 'Admin Retrieved',
			},
		};
	};
}

export function banAdmin() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		if (request.account?.id === request.params.id) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'You cannot ban yourself, Please select a different admin to ban',
					data: null,
				},
			};
		}

		const updatedAmin = await AdminRepo.banAdmin(request.params.id);
		if (!updatedAmin) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: updatedAmin,
				message: 'Admin banned',
			},
		};
	};
}

export function banCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const bannedCaregiver = await CaregiverRepo.banCaregiver(request.params.id);
		if (!bannedCaregiver) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such caregiver Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: bannedCaregiver,
				message: 'Caregiver Successfully banned from using the application',
			},
		};
	};
}
export function banPatient() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const bannedPatient = await PatientRepo.banPatient(request.params.id);
		if (!bannedPatient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: bannedPatient,
				message: 'Patient Successfully banned from using the application!',
			},
		};
	};
}

export function verifyCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const verifiedCaregiver = await CaregiverRepo.verifyCaregiver(request.params.id);
		if (!verifiedCaregiver) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such caregiver Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: verifiedCaregiver,
				message: 'Caregiver verified',
			},
		};
	};
}

export function verifyPatient() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const verifiedPatient = await PatientRepo.verifyPatient(request.params.id);
		if (!verifiedPatient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No such patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: verifiedPatient,
				message: 'Patient verified!',
			},
		};
	};
}

export function updateAdmin() {
	return async function (
		request: HTTPRequest<
			{
				id: string;
			},
			UpdateAdminDto
		>
	) {
		const admin = await AdminRepo.updateAdmin(request.params.id, request.body);

		if (!admin) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No admin Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: admin,
				message: 'Admin updated',
			},
		};
	};
}
