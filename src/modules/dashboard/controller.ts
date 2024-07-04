import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { AdminRepo } from '../users/admins/repo';
import { CaregiverRepo } from '../users/caregivers/repo';
import { PatientRepo } from '../users/patients/repo';
import { AppointmentRepo } from '../appointments/repo';

export function getOverview() {
	return async function (_: HTTPRequest<object, object, object>) {
		try {
			const admins = await AdminRepo.getAllAdmins();
			const caregivers = await CaregiverRepo.getAllCaregivers();
			const patients = await PatientRepo.getAllPatients();
			const appointments = await AppointmentRepo.getAllAppointments();

			const overviewData = {
				admins: admins.length,
				caregivers: caregivers.length,
				patients: patients.length,
				appointments: appointments.length,
			};

			return response(StatusCodes.OK, overviewData, 'Successfully returned stats overview');
		} catch (error) {
			return response(StatusCodes.INTERNAL_SERVER_ERROR, error as object, 'Failed to get stats');
		}
	};
}
