import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { db } from '@/db'

export function getAllPayments() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function ( _: HTTPRequest<object> ) {
		const payments = await db.payments.find( {} )
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: payments,
				message: 'Payments Retrieved',
			},
		}
	}
}

export function getPayment() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const payment = await db.payments.findById( request.params.id )

		if ( !payment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Payment Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: payment,
				message: 'Payment Retrieved',
			},
		}
	}
}

export function makeMomoPayement() {
	return async function (
		request: HTTPRequest<{
			id: string
		}>,
	) {
		const payment = await db.payments.findByIdAndDelete( request.params.id )

		if ( !payment ) {
			return {
				statusCode: StatusCodes.NOT_FOUND,
				body: {
					message: 'No Payment Found',
					data: null,
				},
			}
		}

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: payment,
				message: 'Payment deleted',
			},
		}
	}
}
