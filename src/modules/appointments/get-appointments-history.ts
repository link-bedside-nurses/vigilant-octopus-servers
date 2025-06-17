import { StatusCodes } from 'http-status-codes';

import { HTTPRequest } from '../../express-callback';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { response } from '../../utils/http-response';
import { DESIGNATION } from '../../interfaces';
import { APPOINTMENT_STATUSES } from '../../interfaces';

type Filters = {
    designation: DESIGNATION
    status?: APPOINTMENT_STATUSES
    patientId?: string
    caregiverId?: string
};

export function getAppointmentsHistory() {
    return async function (
        request: HTTPRequest<object, object, { filters: Filters }>
    ) {
        const { filters } = request.query;

        const appointments = await AppointmentRepo.getAppointmentsHistory( filters.designation, filters.status, filters.patientId, filters.caregiverId );
        return response( StatusCodes.OK, appointments, 'Appointments retrieved successfully' );
    };
}
