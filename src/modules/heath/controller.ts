import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';

export function ping() {
	return async function () {
		console.log( 'server is running:sending pong' );
		return response( StatusCodes.OK, null, 'pong' );
	};
}

export function error() {
	return async function () {
		console.log( 'Intended Error!' );
		throw new Error( 'Intended Error!' );
	};
}
