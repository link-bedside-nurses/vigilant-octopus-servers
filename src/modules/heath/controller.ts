import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';

export function ping() {
	return async function () {
		return response(StatusCodes.OK, null, 'pong');
	};
}

export function error() {
	return async function () {
		throw new Error('Intended Error!');
	};
}
