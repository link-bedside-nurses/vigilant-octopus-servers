import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { AdminRepo } from '../../infra/database/repositories/admin-repository';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { AppointmentRepo } from '../../infra/database/repositories/appointment-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';

export function getOverview() {
	return async function ( _: HTTPRequest<object, object, object> ) {
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

		console.log( 'overviewData retrieved successfully', overviewData );

		return response( StatusCodes.OK, overviewData, 'Successfully returned stats overview' );
	};
}
