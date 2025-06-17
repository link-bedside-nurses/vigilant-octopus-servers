import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../express-callback';
import { response } from '../../../utils/http-response';
import { CaregiverRepo } from '../../../database/repositories/caregiver-repository';

export function cancelAppointmentRequest() {
    return async function ( req: HTTPRequest<{ appointmentId: string }> ) {
        try {
            const { appointmentId } = req.params;
            const caregiverId = req.account?.id;

            if ( !caregiverId ) {
                return response(
                    StatusCodes.UNAUTHORIZED,
                    null,
                    'Unauthorized access'
                );
            }

            const appointment = await CaregiverRepo.cancelAppointmentRequest(
                caregiverId,
                appointmentId
            );

            return response(
                StatusCodes.OK,
                appointment,
                'Appointment cancelled successfully'
            );
        } catch ( error: any ) {
            console.error( 'Error cancelling appointment:', error );
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                null,
                error.message || 'Failed to cancel appointment'
            );
        }
    };
}
