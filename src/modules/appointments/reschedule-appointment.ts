import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../express-callback';
import { RescheduleAppointmentDto, RescheduleAppointmentSchema } from '../../interfaces/dtos';
import { response } from '../../utils/http-response';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';

export default function rescheduleAppointment() {
    return async function ( request: HTTPRequest<{ id: string }, RescheduleAppointmentDto, object> ) {
        const result = RescheduleAppointmentSchema.safeParse( request.body );
        if ( !result.success ) {
            return response( StatusCodes.BAD_REQUEST, null, result.error.message );
        }

        const appointment = await AppointmentRepo.getAppointmentById( request.params.id );
        if ( !appointment ) {
            return response( StatusCodes.OK, null, 'Appointment not found' );
        }

        const updatedAppointment = await AppointmentRepo.rescheduleAppointment( request.params.id, result.data.date );

        if ( !updatedAppointment ) {
            return response( StatusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to reschedule appointment' );
        }

        return response( StatusCodes.OK, updatedAppointment, 'Appointment rescheduled successfully' );
    };
}
