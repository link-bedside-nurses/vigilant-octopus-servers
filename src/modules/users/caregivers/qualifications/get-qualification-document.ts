// controllers/get-qualification-document.ts
import { HTTPRequest } from '../../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../../core/utils/http-response';
import path from 'path';
import fs from 'fs';
import { getMimeType } from '../../../../core/utils/mime-types';

export function getQualificationDocument() {
	return async function (request: HTTPRequest<{ id: string; documentPath: string }>) {
		const { id, documentPath } = request.params;

		try {
			const caregiver = await CaregiverRepo.getCaregiverById(id);

			if (!caregiver) {
				return response(StatusCodes.NOT_FOUND, null, 'Caregiver not found');
			}

			// Check if the document belongs to the caregiver
			if (!caregiver.qualifications.includes(documentPath)) {
				return response(StatusCodes.FORBIDDEN, null, 'Document not found for this caregiver');
			}

			const fullPath = path.join(process.cwd(), documentPath);

			// Check if file exists
			if (!fs.existsSync(fullPath)) {
				return response(StatusCodes.NOT_FOUND, null, 'Document file not found');
			}

			// Return file path and metadata
			const stats = fs.statSync(fullPath);
			const fileInfo = {
				path: documentPath,
				fileName: path.basename(documentPath),
				size: stats.size,
				uploadDate: stats.mtime,
				mimeType: getMimeType(path.extname(documentPath).toLowerCase()),
			};

			return response(StatusCodes.OK, fileInfo, 'Document info retrieved');
		} catch (error) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Error retrieving qualification document'
			);
		}
	};
}
