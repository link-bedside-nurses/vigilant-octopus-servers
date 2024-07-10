import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infrastructure/database/repositories/admin-repository';
import { response } from '../../../core/utils/http-response';

export function getAllAdmins() {
	return async function () {
		const admins = await AdminRepo.getAllAdmins();
		return response(StatusCodes.OK, admins, 'Admins Retrieved');
	};
}
