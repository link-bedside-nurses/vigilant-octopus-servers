import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { AdminRepo } from '../../infrastructure/database/repositories/admin-repository';
import { CaregiverRepo } from '../../infrastructure/database/repositories/caregiver-repository';
import { AppointmentRepo } from '../../infrastructure/database/repositories/appointment-repository';
import { PatientRepo } from '../../infrastructure/database/repositories/patient-repository';

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
