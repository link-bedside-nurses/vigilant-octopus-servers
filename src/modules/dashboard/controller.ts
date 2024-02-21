import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../db';

export function getOverview() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function ( _: HTTPRequest<object, object, object> ) {
		try {

			const admins = await db.admins.find( {} )
			const caregivers = await db.caregivers.find( {} )
			const patients = await db.patients.find( {} )
			const appointments = await db.appointments.find( {} )

			return {
				statusCode: StatusCodes.OK,
				body: {
					data: {
						admins: admins.length,
						caregivers: caregivers.length,
						patients: patients.length,
						appointments: appointments.length,
					},
					message: 'successfully returned stats overview',
				},
			};
		} catch ( error ) {
			return {
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				body: {
					data: error,
					message: 'failed to get stats',
				},
			};
		}
	};
}
