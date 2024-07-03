import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../adapters/express-callback';
import { db } from '../../../db';
import { DESIGNATION } from '../../../interfaces';

interface SignUpBody {
	phone: string;
	name: string;
	password: string;
	email: string;
}

export function patientSignup() {
	return async function (request: HTTPRequest<object, Omit<SignUpBody, 'email'>>) {
		const { phone, name } = request.body;

		const missingFields = [];

		if (!phone) {
			missingFields.push('phone');
		}

		if (!name) {
			missingFields.push('name');
		}

		if (missingFields.length > 0) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: `The following fields are missing: ${missingFields.join(', ')}`,
					data: null,
				},
			};
		}

		const patient = await db.patients.findOne({ phone });

		if (patient) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Phone number in use',
					data: null,
				},
			};
		}

		const user = await db.patients.create({
			phone,
			name,
			designation: DESIGNATION.PATIENT,
		});

		await user.save();

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: user,
				message: 'Account created',
			},
		};
	};
}
