import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { UpdateCaregiverDto } from '../../../interfaces/dtos';
import { CaregiverRepo } from '../../users/caregivers/repo';

export function completeCaregiverProfile() {
	return async function (request: HTTPRequest<object, UpdateCaregiverDto>) {
		const caregiverId = request?.account?.id;
		const {
			phone,
			firstName,
			lastName,
			dateOfBirth,
			nin,
			experience,
			description,
			location,
			imageUrl,
		} = request.body;

		if (
			!caregiverId ||
			!phone ||
			!firstName ||
			!lastName ||
			!dateOfBirth ||
			!nin ||
			!experience ||
			!description ||
			!location ||
			!imageUrl
		) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Incomplete or invalid request data',
				},
			};
		}

		const updatedCaregiver = await CaregiverRepo.findByIdAndUpdate(caregiverId, request.body);
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: updatedCaregiver,
				message: 'Profile completed',
			},
		};
	};
}
