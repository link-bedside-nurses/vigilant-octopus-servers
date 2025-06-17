import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { ScheduleAppointmentDto, ScheduleAppointmentSchema } from '../../interfaces/dtos';
import { CaregiverRepo } from '../../database/repositories/caregiver-repository';
import { PatientRepo } from '../../database/repositories/patient-repository';
import { response } from '../../utils/http-response';
import { HTTPRequest } from '../../express-callback';

export function scheduleAppointment() {
	return async function ( request: HTTPRequest<object, ScheduleAppointmentDto, { lat: string; lng: string }> ) {
		try {
			// First validate location from query params
			if ( !request.query.lat || !request.query.lng ) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Location coordinates (lat, lng) are required as query parameters'
				);
			}

			const latitude = Number( request.query.lat );
			const longitude = Number( request.query.lng );

			// Validate coordinate ranges
			if ( isNaN( latitude ) || latitude < -90 || latitude > 90 ||
				isNaN( longitude ) || longitude < -180 || longitude > 180 ) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid coordinates provided'
				);
			}

			const result = ScheduleAppointmentSchema.safeParse( {
				...request.body,
				location: {
					type: 'Point',
					coordinates: [longitude, latitude] // Note: GeoJSON format is [longitude, latitude]
				}
			} );

			if ( !result.success ) {
				console.log( 'result.error', result.error );
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				);
			}

			console.log( 'result.data', result.data );
			const caregiver = await CaregiverRepo.getCaregiverById( result.data.caregiver );
			console.log( 'caregiver', caregiver );
			if ( !caregiver ) {
				console.log( 'caregiver not found' );
				return response( StatusCodes.BAD_REQUEST, null, `No such caregiver with given id` );
			}

			console.log( 'caregiver found' );

			const patient = await PatientRepo.getPatientById( request.account?.id! );

			console.log( 'patient', patient );

			if ( !patient ) {
				return response( StatusCodes.BAD_REQUEST, null, `No such patient with given id` );
			}

			console.log( 'patient found' );


			console.log( 'scheduling appointment with patient', request.account?.id!, 'with data', result.data );

			const appointment = await AppointmentRepo.scheduleAppointment(
				request.account?.id!,
				result.data
			);

			console.log( 'appointment scheduled successfully', appointment );

			return response( StatusCodes.OK, appointment, 'Appointment Scheduled' );
		} catch ( error: any ) {
			console.error( 'Error scheduling appointment:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to schedule appointment'
			);
		}
	};
}
