import { HTTPRequest } from '../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { AppointmentRepo } from '../../../database/repositories/appointment-repository';
import { response } from '../../../utils/http-response';

export function getCaregiverAppointmentHistory() {
    return async function ( request: HTTPRequest<{ id: string }, object, object> ) {
        console.log( 'calling getCaregiverAppointmentHistory' );
        console.log( 'request.params.id', request.params.id );
        const appointments = await AppointmentRepo.getCaregiverAppointmentHistory( request.params.id );
        console.log( 'appointments', appointments );
        const message =
            appointments.length > 0
                ? 'Successfully fetched caregiver Appointment History'
                : 'No Appointment History Found';
        console.log( 'message', message );
        console.log( 'appointments.length', appointments.length );
        return response( StatusCodes.OK, appointments, message );
    };
}
