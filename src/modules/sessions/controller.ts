/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/database'

export function getAllSessions() {
	return async function (_: HTTPRequest<object, object>) {
		const sessions = await db.sessions.find({})

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: sessions,
				message: sessions.length === 0 ? 'No Sessions Scheduled' : 'All sessions retrieved',
			},
		}
	}
}

export function getPatientSessions() {
	return async function (request: HTTPRequest<{ patientId: string }, object>) {
		const sessions = await db.sessions.find({
			patientId: request.params.patientId,
		})

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: sessions,
				message: sessions.length === 0 ? 'No sessions scheduled' : 'Sessions fetched',
			},
		}
	}
}

export function getCaregiverSessions() {
	return async function (request: HTTPRequest<{ caregiverId: string }, object>) {
		const sessions = await db.sessions.find({
			caregiverId: request.params.caregiverId,
		})

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: sessions,
				message: sessions.length === 0 ? 'No sessions scheduled' : 'Sessions fetched',
			},
		}
	}
}

export function confirmSession() {
	return async function (request: HTTPRequest<{ id: string }, object>) {
		const session = await db.sessions.findById(request.params.id)

		if (!session) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not confirm session. This session has not been setup or initiated by anyone',
				},
			}
		}

		await session.confirmSession()

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: session,
				message: 'Session has been confirmed and initiated',
			},
		}
	}
}

export function cancelSession() {
	return async function (
		request: HTTPRequest<
			{ id: string },
			{
				reason?: string
			}
		>,
	) {
		const session = await db.sessions.findById(request.params.id)

		if (!session) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not cancel session. This session has not been setup or initiated by anyone',
				},
			}
		}

		await session.cancelSession(request.body.reason)

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: session,
				message: 'Session has been confirmed and initiated',
			},
		}
	}
}

export function getSession() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const session = await db.sessions.findById(request.params.id)

		if (!session) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					data: null,
					message: 'Could not get session. This session has not been setup or initiated by anyone',
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: session,
				message: 'Session has been confirmed and initiated',
			},
		}
	}
}

export function deleteSession() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const session = await db.sessions.findByIdAndDelete(request.params.id)

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: session,
				message: 'Session has been deleted',
			},
		}
	}
}
