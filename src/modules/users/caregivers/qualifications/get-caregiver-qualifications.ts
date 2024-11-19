// controllers/get-caregiver-qualifications.ts
import { HTTPRequest } from '../../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../../core/utils/http-response';
import path from 'path';
import fs from 'fs';
import { getMimeType } from '../../../../core/utils/mime-types';

// Define an interface for the file info structure
interface QualificationFileInfo {
	path: string;
	fileName: string;
	exists: boolean;
	size: number;
	uploadDate: Date | null;
	mimeType: string;
}

export function getCaregiverQualifications() {
	return async function (request: HTTPRequest<{ id: string }>) {
		try {
			const caregiver = await CaregiverRepo.getCaregiverById(request.params.id);

			if (!caregiver) {
				return response(StatusCodes.NOT_FOUND, null, 'Caregiver not found');
			}

			// Get detailed information for each qualification document
			const qualificationDetails = caregiver.qualifications.map((docPath) => {
				const fullPath = path.join(process.cwd(), docPath);
				const fileInfo: QualificationFileInfo = {
					path: docPath,
					fileName: path.basename(docPath),
					exists: false,
					size: 0,
					uploadDate: null,
					mimeType: getMimeType(path.extname(docPath).toLowerCase()),
				};

				if (fs.existsSync(fullPath)) {
					const stats = fs.statSync(fullPath);
					fileInfo.exists = true;
					fileInfo.size = stats.size;
					fileInfo.uploadDate = stats.mtime;
				}

				return fileInfo;
			});

			return response(
				StatusCodes.OK,
				{ qualifications: qualificationDetails },
				'Qualification documents retrieved'
			);
		} catch (error) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Error retrieving qualification documents'
			);
		}
	};
}
