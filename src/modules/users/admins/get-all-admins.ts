import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { response } from '../../../core/utils/http-response';

export function getAllAdmins() {
	return async function () {
		console.log( 'calling getAllAdmins' );
		const admins = await AdminRepo.getAllAdmins();
		console.log( 'admins', admins );
		return response( StatusCodes.OK, admins, 'Admins Retrieved' );
	};
}
