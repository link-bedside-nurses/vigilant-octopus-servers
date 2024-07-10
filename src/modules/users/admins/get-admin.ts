import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infra/database/repositories/admin-repository';
import { response } from '../../../core/utils/http-response';

export function getAdmin() {
	return async function (request: HTTPRequest<{ id: string }>) {
		const admin = await AdminRepo.getAdminById(request.params.id);
		if (!admin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, admin, 'Admin Retrieved');
	};
}
