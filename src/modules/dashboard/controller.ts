import { HTTPRequest } from '../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { AdminRepo } from '../../database/repositories/admin-repository';
import { CaregiverRepo } from '../../database/repositories/caregiver-repository';
import { AppointmentRepo } from '../../database/repositories/appointment-repository';
import { PatientRepo } from '../../database/repositories/patient-repository';

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
