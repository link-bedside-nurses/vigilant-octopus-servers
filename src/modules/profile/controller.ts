import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function completeCaregiverProfile() {
	return async function (
		request: HTTPRequest<
			object,
			{
				phone: string
				firstName: string
				lastName: string
				dateOfBirth: string
				nin: string
				medicalLicenseNumber: string
				experience: string
				description: string
				location: {
					lng: number
					lat: number
				}
				languages: string[]
				affiliations: string
				placeOfReception: string
				rating: number
				speciality: string
				servicesOffered: string
				imageUrl: string
			}
		>,
	) {
		const caregiverId = request?.account?.id
		const {
			phone,
			firstName,
			lastName,
			dateOfBirth,
			nin,
			medicalLicenseNumber,
			experience,
			description,
			location,
			languages,
			affiliations,
			placeOfReception,
			speciality,
			servicesOffered,
			imageUrl,
		} = request.body

		if (
			!caregiverId ||
			!phone ||
			!firstName ||
			!lastName ||
			!dateOfBirth ||
			!nin ||
			!medicalLicenseNumber ||
			!experience ||
			!description ||
			!location ||
			!languages ||
			!affiliations ||
			!placeOfReception ||
			!speciality ||
			!servicesOffered ||
			!imageUrl
		) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Incomplete or invalid request data',
				},
			}
		}

		const updatedCaregiver = await db.caregivers.findByIdAndUpdate(request?.account?.id, {
			phone,
			firstName,
			lastName,
			dateOfBirth,
			nin,
			medicalLicenseNumber,
			experience,
			description,
			location,
			languages,
			affiliations,
			placeOfReception,
			speciality,
			servicesOffered,
			imageUrl,
		})

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: updatedCaregiver,
				message: 'Profile completed',
			},
		}
	}
}
