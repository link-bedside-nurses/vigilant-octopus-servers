import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { AdminRepo } from '../users/admins/repository';
import { CaregiverRepo } from '../users/caregivers/repository';
import { PatientRepo } from '../users/patients/repository';
import { AppointmentRepo } from '../appointments/repository';

export function getOverview() {
	return async function (_: HTTPRequest<object, object, object>) {
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
	};
}
