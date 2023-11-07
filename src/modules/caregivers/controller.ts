import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getAllCaregivers() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object>) {
		const caregivers = await db.caregivers.find({})
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: caregivers,
				message: 'caregivers Retrieved',
			},
		}
	}
}

export function getCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const caregiver = await db.caregivers.findById(request.params.id)

		if (!caregiver) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No caregiver Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: caregiver,
				message: 'caregiver Retrieved',
			},
		}
	}
}

export function deleteCaregiver() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const caregiver = await db.caregivers.findByIdAndDelete(request.params.id)

		if (!caregiver) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No caregiver Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: caregiver,
				message: 'caregiver deleted',
			},
		}
	}
}

interface UpdateBody {
	phone: string
	firstName: string
	lastName: string
	nin: string
	medicalLicenseNumber: string
	description: string
	placeOfReception: string
	speciality: string[]
	languages: string[]
	affiliations: string[]
	experience: 0
	servicesOffered: string[]
	imgUrl: string
}

export function updateCaregiver() {
	return async function (
		request: HTTPRequest<
			{
				id: string
			},
			UpdateBody
		>,
	) {
		const caregiver = await db.caregivers.findByIdAndUpdate(request.params.id, { ...request.body }, { new: true })

		if (!caregiver) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No caregiver Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: caregiver,
				message: 'caregiver updated',
			},
		}
	}
}
