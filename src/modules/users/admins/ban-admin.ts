import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infrastructure/database/repositories/admin-repository';
import { response } from '../../../core/utils/http-response';

export function banAdmin() {
	return async function (request: HTTPRequest<{ id: string }>) {
		if (request.account?.id === request.params.id) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'You cannot ban yourself, Please select a different admin to ban'
			);
		}
		const updatedAdmin = await AdminRepo.banAdmin(request.params.id);
		if (!updatedAdmin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, updatedAdmin, 'Admin banned');
	};
}
