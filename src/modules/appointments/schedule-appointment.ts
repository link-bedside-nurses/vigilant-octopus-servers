import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { ScheduleAppointmentDto, ScheduleAppointmentSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';

export function scheduleAppointment() {
	return async function ( request: HTTPRequest<object, ScheduleAppointmentDto, object> ) {
		const result = ScheduleAppointmentSchema.safeParse( request.body );
		console.log( 'result', result );

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
	};
}
