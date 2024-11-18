// controllers/stream-qualification-document.ts
import { Request, Response } from 'express';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import path from 'path';
import fs from 'fs';
import { getMimeType } from '../../../core/utils/mime-types';
import { response } from '../../../core/utils/http-response';
import { StatusCodes } from 'http-status-codes';

export async function streamQualificationDocument(req: Request, res: Response) {
	const { id, documentPath } = req.params;

	try {
		const caregiver = await CaregiverRepo.getCaregiverById(id);

		if (!caregiver || !caregiver.qualifications.includes(documentPath)) {
			return response(StatusCodes.NOT_FOUND, null, 'Document not found');
		}

		const fullPath = path.join(process.cwd(), documentPath);

		if (!fs.existsSync(fullPath)) {
			return response(StatusCodes.NOT_FOUND, null, 'File not found');
		}

		const mimeType = getMimeType(path.extname(fullPath).toLowerCase());
		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `inline; filename="${path.basename(documentPath)}"`);

		const stream = fs.createReadStream(fullPath);
		stream.pipe(res);
		stream.on('end', () => {
			res.end();
		});
	} catch (error) {
		return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'Error streaming document');
	}
}
