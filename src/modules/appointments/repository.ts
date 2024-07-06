import mongoose from 'mongoose';
import { db } from '../../db';
import { ObjectId } from 'mongodb';
import { Appointment } from '../../db/schemas/Appointment';
import { ScheduleAppointmentDto } from '../../interfaces/dtos';
import { APPOINTMENT_STATUSES } from '../../interfaces';

export class AppointmentRepo {
	public static async scheduleAppointment(patientId: string, appointment: ScheduleAppointmentDto) {
		const result = await db.appointments.create({ appointment, patient: patientId });

		return (await (await result.save()).populate('patient')).populate('caregiver');
	}

	public static async getAllAppointments() {
		return await db.appointments
			.find({})
			.sort({ createdAt: 'desc' })
			.populate('caregiver')
			.populate('patient');
	}

	public static async getCaregiverAppointments(caregiverId: string) {
		return await db.appointments
			.find({
				caregiver: {
					_id: caregiverId,
				},
			})
			.populate('patient')
			.populate('caregiver');
	}

	public static async getPatientAppointments(id: string, status?: APPOINTMENT_STATUSES) {
		let filters: mongoose.FilterQuery<Appointment> = {
			patient: { _id: id },
		};

		if (status) {
			filters = { ...filters, status };
		}

		const pipeline: mongoose.PipelineStage[] = [
			{
				$match: {
					patient: new ObjectId(id),
				},
			},
			{
				$addFields: {
					order: {
						$switch: {
							branches: [
								{
									case: {
										$eq: ['$status', 'ongoing'],
									},
									then: 1,
								},
								{
									case: {
										$eq: ['$status', 'pending'],
									},
									then: 2,
								},
								{
									case: {
										$eq: ['$status', 'cancelled'],
									},
									then: 3,
								},
								{
									case: {
										$eq: ['$status', 'completed'],
									},
									then: 4,
								},
							],
							default: 5,
						},
					},
				},
			},
			{
				$sort: {
					createdAt: -1,
				},
			},
		];

		if (status) {
			pipeline.push({
				$match: {
					status: status,
				},
			});
		}

		let appointments = await db.appointments.aggregate(pipeline);

		appointments = await db.caregivers.populate(appointments, {
			path: 'caregiver',
		});

		return await db.patients.populate(appointments, {
			path: 'patient',
		});
	}

	public static async getAppointmentById(id: string) {
		return await db.appointments.findById(id).populate('caregiver').populate('patient');
	}

	public static async deleteAppointment(id: string) {
		return await db.appointments.findByIdAndDelete(id);
	}
}
