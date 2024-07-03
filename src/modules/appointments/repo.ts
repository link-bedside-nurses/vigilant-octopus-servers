import { db } from '../../db';
import { CreateAppointmentDto } from '../../interfaces/dtos';

export class AppointmentRepo {
	public static async createAppointment(appointment: CreateAppointmentDto) {
		return await db.appointments.create(appointment);
	}

	public static async getPatient(phone: string) {
		return await db.patients.findOne({ phone });
	}

	public static async getAppointment(phone: string) {
		return await db.appointments.findOne({ phone });
	}
	public static async getCaregiver(phone: string) {
		return await db.caregivers.findOne({ phone });
	}
}
