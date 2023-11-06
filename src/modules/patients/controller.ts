import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getAllPatients() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object>) {
		const patients = await db.users.find({ designation: 'PATIENT' })
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patients,
				message: 'Patients Retrieved',
			},
		}
	}
}

export function getPatient() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const patient = await db.users.findById(request.params.id)

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient Retrieved',
			},
		}
	}
}

export function deletePatient() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const patient = await db.users.findByIdAndDelete(request.params.id)

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient deleted',
			},
		}
	}
}

interface UpdateBody {
	phone: string
	firstName: string
	lastName: string
}

export function updatePatient() {
	return async function (
		request: HTTPRequest<
			{
				id: string
			},
			UpdateBody
		>,
	) {
		const patient = await db.users.findByIdAndUpdate(request.params.id, { ...request.body }, { new: true })

		if (!patient) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Patient Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: patient,
				message: 'Patient updated',
			},
		}
	}
}