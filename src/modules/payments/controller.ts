import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../db';
import { response } from '../../utils/http-response';

export function getAllPayments() {
	return async function (_: HTTPRequest<object>) {
		const payments = await db.payments.find({}).sort({ createdAt: 'desc' });
		return response(StatusCodes.OK, payments, 'Payments Retrieved');
	};
}

export function getPayment() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const payment = await db.payments.findById(request.params.id);

		if (!payment) {
			return response(StatusCodes.NOT_FOUND, null, 'No Payment Found');
		}

		return response(StatusCodes.OK, payment, 'Payment Retrieved');
	};
}

export function makeMomoPayment() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const payment = await db.payments.findByIdAndDelete(request.params.id);

		if (!payment) {
			return response(StatusCodes.NOT_FOUND, null, 'No Payment Found');
		}

		return response(StatusCodes.OK, payment, 'Payment deleted');
	};
}
