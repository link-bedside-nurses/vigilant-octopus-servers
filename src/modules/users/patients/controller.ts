/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../db';

export function getAllPatients() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object>) {
		const patients = await db.patients.find({}).sort({ createdAt: 'desc' });
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patients,
				message: 'Patients Retrieved',
			},
		};
	};
}

export function getPatient() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const patient = await db.patients.findById(request.params.id);

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient Retrieved',
			},
		};
	};
}

export function deletePatient() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const patient = await db.patients.findByIdAndDelete(request.params.id);

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient deleted',
			},
		};
	};
}

interface UpdateBody {
	phone: string;
	firstName: string;
	lastName: string;
}

export function updatePatient() {
	return async function (
		request: HTTPRequest<
			{
				id: string;
			},
			UpdateBody
		>
	) {
		const patient = await db.patients.findByIdAndUpdate(
			request.params.id,
			{ ...request.body },
			{ new: true }
		);

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient updated',
			},
		};
	};
}

export function deactivatePatient() {
	return async function (
		request: HTTPRequest<
			{
				id: string;
			},
			UpdateBody
		>
	) {
		const patient = await db.patients.findByIdAndUpdate(
			request.params.id,
			{ $set: { isDeactivated: true } },
			{ new: true }
		);

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			};
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient updated',
			},
		};
	};
}
