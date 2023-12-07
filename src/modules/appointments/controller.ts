/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db'

export function getAllAppointments() {
	return async function ( _: HTTPRequest<object, object> ) {
		const appointments = await db.appointments.find( {} )

		console.log( "appointments: ", appointments )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointments,
				message: appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved',
			},
		}
	}
}

export function getPatientAppointments() {
	return async function ( request: HTTPRequest<{ patientId: string }, object> ) {

		const appointments = await db.appointments.find( {
			patient: request.params.patientId,
		} )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointments,
				message: appointments.length === 0 ? 'No appointments scheduled' : 'Appointments fetched',
			},
		}
	}
}

export function getCaregiverAppointments() {
	return async function ( request: HTTPRequest<{ caregiverId: string }, object> ) {
		const appointments = await db.appointments.find( {
			caregiver: request.params.caregiverId,
		} )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointments,
				message: appointments.length === 0 ? 'No appointments scheduled' : 'Appointments fetched',
			},
		}
	}
}

export function scheduleAppointment() {
	return async function ( request: HTTPRequest<object, {
		title: string
		caregiverId: string
		description: string
		notes: string
	}, object> ) {

		console.log( "data: ", request.body )

		if ( !( request.body.title && request.body.description && request.body.notes ) ) {
			const missingFields = [];

			if ( !request.body.title ) {
				missingFields.push( 'title' );
			}

			if ( !request.body.description ) {
				missingFields.push( 'description' );
			}

			if ( !request.body.notes ) {
				missingFields.push( 'notes' );
			}

			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: `The following fields are missing: ${missingFields.join( ', ' )}`,
					data: null,
				},
			};
		}

		const appointments = await db.appointments.create( {
			title: request.body.title,
			description: request.body.description,
			notes: request.body.notes,
			patient: request.account?.id,
			caregiver: request.body.caregiverId
		} )

		await appointments.save()

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointments,
				message: 'Appointment Scheduled',
			},
		}
	}
}

export function confirmAppointment() {
	return async function ( request: HTTPRequest<{ id: string }, object> ) {
		const appointment = await db.appointments.findById( request.params.id )

		if ( !appointment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not confirm appointment. This appointment has not been scheduled yet',
				},
			}
		}

		await appointment.confirmAppointment()

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment has been confirmed and initiated',
			},
		}
	}
}

export function cancelAppointment() {
	return async function (
		request: HTTPRequest<
			{ id: string },
			{
				reason?: string
			}
		>,
	) {
		const appointment = await db.appointments.findById( request.params.id )

		if ( !appointment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not cancel appointment. This appointment has not been scheduled yet',
				},
			}
		}

		await appointment.cancelAppointment( request.body.reason )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment has been confirmed and initiated',
			},
		}
	}
}

export function getAppointment() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const appointment = await db.appointments.findById( request.params.id ).populate( "caregiver" ).populate( "patient" )

		if ( !appointment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not get appointment. This appointment has not been scheduled yet',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment has been confirmed and initiated',
			},
		}
	}
}

export function deleteAppointment() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const appointment = await db.appointments.findByIdAndDelete( request.params.id )

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: appointment,
				message: 'Appointment has been deleted',
			},
		}
	}
}
