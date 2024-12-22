import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { HTTPRequest } from '../../api/adapters/express-callback';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { APPOINTMENT_STATUSES } from '../../core/interfaces';

export function updateAppointmentStatus() {
    return async function ( request: HTTPRequest<{ id: string }, { status: APPOINTMENT_STATUSES }, object> ) {
        const appointment = await AppointmentRepo.getAppointmentById( request.params.id );

        console.log( 'appointment', appointment );

        if ( !appointment ) {
            return response( StatusCodes.NOT_FOUND, null, 'Could not update appointment.' );
        }

        await appointment.updateAppointmentStatus( { status: request.body.status } );

        console.log( 'appointment updated successfully', appointment );

        return response( StatusCodes.OK, appointment, 'Appointment has been updated' );
    };
}
