// controllers/upload-qualifications.ts
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../core/utils/http-response';

export function uploadQualifications() {
	return async function (request: HTTPRequest<any>) {
		const files = request.files as unknown as Express.Multer.File[];
		const caregiverId = request.params.id;

		if (!files || files.length === 0) {
			return response(StatusCodes.BAD_REQUEST, null, 'No files uploaded');
		}

		const filePaths = files.map((file) => file.path);

		try {
			const caregiver = await CaregiverRepo.addQualificationDocuments(caregiverId, filePaths);

			if (!caregiver) {
				return response(StatusCodes.NOT_FOUND, null, 'Caregiver not found');
			}

			return response(
				StatusCodes.OK,
				{ qualifications: caregiver.qualifications },
				'Qualification documents uploaded successfully'
			);
		} catch (error) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Error uploading qualification documents'
			);
		}
	};
}
