import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../db';

export function getOverview() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function ( _: HTTPRequest<object, object, object> ) {
		try {

			const admins = await db.admins.find( {} ).sort( { createdAt: "desc" } )
			const caregivers = await db.caregivers.find( {} ).sort( { createdAt: "desc" } )
			const patients = await db.patients.find( {} ).sort( { createdAt: "desc" } )
			const appointments = await db.appointments.find( {} ).sort( { createdAt: "desc" } )

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
