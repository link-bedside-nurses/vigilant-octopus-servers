/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db'

export function getAllAppointments() {
	return async function ( _: HTTPRequest<object, object> ) {
		const appointments = await db.appointments.find( {} )

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
			patientId: request.params.patientId,
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
			caregiverId: request.params.caregiverId,
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

export function confirmAppointment() {
	return async function ( request: HTTPRequest<{ id: string }, object> ) {
		const appointment = await db.appointments.findById( request.params.id )

		if ( !appointment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not confirm appointment. This appointment has not been setup or initiated by anyone',
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
					message: 'Could not cancel appointment. This appointment has not been setup or initiated by anyone',
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
		const appointment = await db.appointments.findById( request.params.id )

		if ( !appointment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not get appointment. This appointment has not been setup or initiated by anyone',
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
