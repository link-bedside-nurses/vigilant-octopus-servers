import { StatusCodes } from 'http-status-codes';

import { HTTPRequest } from '../../api/adapters/express-callback';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { response } from '../../core/utils/http-response';
import { DESIGNATION } from '../../core/interfaces';
import { APPOINTMENT_STATUSES } from '../../core/interfaces';

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
