import mongoose from 'mongoose';
import { db } from '..';
import { ObjectId } from 'mongodb';
import { Appointment } from '../models/Appointment';
import { ScheduleAppointmentDto } from '../../interfaces/dtos';
import { APPOINTMENT_STATUSES, DESIGNATION } from '../../interfaces';

export class AppointmentRepo {
	public static async scheduleAppointment( patient: string, appointment: ScheduleAppointmentDto ) {
		const result = await db.appointments.create( { ...appointment, patient } );

		console.log( 'result', result );

		return ( await ( await result.populate( 'patient' ) ).populate( 'patient' ) ).populate( 'caregiver' );
	}

	public static async getAllAppointments() {
		return await db.appointments
			.find( {} )
			.sort( { createdAt: 'desc' } )
			.populate( 'caregiver' )
			.populate( 'patient' );
	}

	public static async getCaregiverAppointments( caregiverId: string ) {
		return await db.appointments
			.find( {
				caregiver: {
					_id: caregiverId,
				},
			} )
			.populate( 'patient' )
			.populate( 'caregiver' );
	}

	public static async getCaregiverAppointmentHistory( caregiverId: string, ) {
		console.log( 'caregiverId', caregiverId );
		const appointments = await db.appointments
			.find( {
				caregiver: {
					_id: caregiverId,
				},
			} )
			.populate( 'patient' )
			.populate( 'caregiver' );

		console.log( 'appointments', appointments );

		const filteredAppointments = appointments.filter( ( appointment ) => appointment.status === APPOINTMENT_STATUSES.COMPLETED || appointment.status === APPOINTMENT_STATUSES.CANCELLED );
		console.log( 'filteredAppointments', filteredAppointments );
		return filteredAppointments;
	}

	public static async getPatientAppointments( id: string, status?: APPOINTMENT_STATUSES ) {
		console.log( 'id', id );
		let filters: mongoose.FilterQuery<Appointment> = {
			patient: { _id: id },
		};
		console.log( 'filters', filters );

		if ( status ) {
			filters = { ...filters, status };
		}

		const pipeline: mongoose.PipelineStage[] = [
			{
				$match: {
					patient: new ObjectId( id ),
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

		console.log( 'pipeline', pipeline );

		if ( status ) {
			pipeline.push( {
				$match: {
					status: status,
				},
			} );
		}

		let appointments = await db.appointments.aggregate( pipeline );

		console.log( 'appointments', appointments );

		appointments = await db.caregivers.populate( appointments, {
			path: 'caregiver',
		} );

		console.log( 'appointments after caregiver', appointments );

		return await db.patients.populate( appointments, {
			path: 'patient',
		} );
	}

	public static async rescheduleAppointment( appointmentId: string, date: string ) {
		return await db.appointments.findByIdAndUpdate( appointmentId, { date } );
	}

	public static async getAppointmentsHistory(
		designation: DESIGNATION,
		status?: APPOINTMENT_STATUSES,
		patientId?: string,
		caregiverId?: string
	) {
		try {
			const query: mongoose.FilterQuery<Appointment> = {};

			// Add status filter if provided
			if ( status ) {
				query.status = status;
			}

			// Add user-specific filters based on designation
			if ( designation === DESIGNATION.PATIENT && patientId ) {
				query.patient = new ObjectId( patientId );
			} else if ( designation === DESIGNATION.CAREGIVER && caregiverId ) {
				query.caregiver = new ObjectId( caregiverId );
			}

			const pipeline: mongoose.PipelineStage[] = [
				{
					$match: query
				},
				{
					$addFields: {
						order: {
							$switch: {
								branches: [
									{
										case: { $eq: ['$status', 'ongoing'] },
										then: 1
									},
									{
										case: { $eq: ['$status', 'pending'] },
										then: 2
									},
									{
										case: { $eq: ['$status', 'cancelled'] },
										then: 3
									},
									{
										case: { $eq: ['$status', 'completed'] },
										then: 4
									}
								],
								default: 5
							}
						}
					}
				},
				{
					$sort: {
						order: 1,
						createdAt: -1
					}
				},
				{
					$lookup: {
						from: 'patients',
						localField: 'patient',
						foreignField: '_id',
						as: 'patient'
					}
				},
				{
					$lookup: {
						from: 'caregivers',
						localField: 'caregiver',
						foreignField: '_id',
						as: 'caregiver'
					}
				},
				{
					$unwind: {
						path: '$patient',
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$unwind: {
						path: '$caregiver',
						preserveNullAndEmptyArrays: true
					}
				}
			];

			const appointments = await db.appointments.aggregate( pipeline );
			console.log( 'Filtered appointments:', appointments );

			return appointments;
		} catch ( error ) {
			console.error( 'Error in getAppointmentsHistory:', error );
			throw error;
		}
	}

	public static async getAppointmentById( id: string ) {
		return await db.appointments.findById( id ).populate( 'caregiver' ).populate( 'patient' );
	}

	public static async deleteAppointment( id: string ) {
		return await db.appointments.findByIdAndDelete( id );
	}
}
