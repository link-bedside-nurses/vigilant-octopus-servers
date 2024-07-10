import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { AdminRepo } from '../../../infrastructure/database/repositories/admin-repository';
import { UpdateAdminDto } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';

export function updateAdmin() {
	return async function (request: HTTPRequest<{ id: string }, UpdateAdminDto>) {
		const admin = await AdminRepo.updateAdmin(request.params.id, request.body);
		if (!admin) {
			return response(StatusCodes.NOT_FOUND, null, 'No admin Found');
		}
		return response(StatusCodes.OK, admin, 'Admin updated');
	};
}
