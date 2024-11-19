import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';

export class QualificationsController {
	public static async uploadQualifications(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const files = req.files as Express.Multer.File[];

			if (!files || files.length === 0) {
				return res.status(400).json({ message: 'No files uploaded' });
			}

			// Get existing caregiver to update qualifications
			const caregiver = await CaregiverRepo.getCaregiverById(id);
			if (!caregiver) {
				return res.status(404).json({ message: 'Caregiver not found' });
			}

			// Map uploaded files to their paths
			const qualificationPaths = files.map(
				(file) => `/public/uploads/qualifications/${file.filename}`
			);

			// Update caregiver's qualifications
			caregiver.qualifications = [...(caregiver.qualifications || []), ...qualificationPaths];

			await caregiver.save();

			return res.status(200).json({
				message: 'Qualifications uploaded successfully',
				uploadedFiles: qualificationPaths,
			});
		} catch (error) {
			console.error('Upload error:', error);
			return res.status(500).json({ message: 'Error uploading qualifications' });
		}
	}

	public static async getQualificationDocs(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const caregiver = await CaregiverRepo.getCaregiverById(id);

			if (!caregiver) {
				return res.status(404).json({ message: 'Caregiver not found' });
			}

			// Fetch full details of qualification documents
			const qualificationDocs = (caregiver.qualifications || []).map((filePath) => ({
				path: filePath,
				fileName: path.basename(filePath),
				fullUrl: `${req.protocol}://${req.get('host')}${filePath}`,
			}));

			return res.status(200).json({
				caregiverId: id,
				qualificationDocs,
			});
		} catch (error) {
			console.error('Fetch qualifications error:', error);
			return res.status(500).json({ message: 'Error fetching qualification documents' });
		}
	}

	public static async deleteQualification(req: Request, res: Response) {
		try {
			const { id, filePath } = req.params;
			const caregiver = await CaregiverRepo.getCaregiverById(id);

			if (!caregiver) {
				return res.status(404).json({ message: 'Caregiver not found' });
			}

			// Remove file from filesystem
			const fullPath = path.join(__dirname, '../', filePath);
			if (fs.existsSync(fullPath)) {
				fs.unlinkSync(fullPath);
			}

			// Remove file path from caregiver's qualifications
			caregiver.qualifications = caregiver.qualifications.filter((qual) => qual !== filePath);

			await caregiver.save();

			return res.status(200).json({
				message: 'Qualification file deleted successfully',
			});
		} catch (error) {
			console.error('Delete error:', error);
			return res.status(500).json({ message: 'Error deleting qualification' });
		}
	}

	public static async downloadQualificationDoc(req: Request, res: Response) {
		try {
			const { id, filename } = req.params;
			const caregiver = await CaregiverRepo.getCaregiverById(id);

			if (!caregiver) {
				return res.status(404).json({ message: 'Caregiver not found' });
			}

			// Verify the file is actually associated with this caregiver
			const found = caregiver.qualifications.find((path) => path.trim().includes(filename.trim()));
			if (!found) {
				return res.status(403).json({ message: 'Unauthorized file access' });
			}

			const fullFilePath = path.resolve(
				__dirname + '../../../../public/uploads/qualifications',
				filename
			);
			console.log('fullFilePath:', fullFilePath);

			// Check if file exists
			if (!fs.existsSync(fullFilePath)) {
				const fileStream = fs.createReadStream(fullFilePath);
				return fileStream.pipe(res);
				// return res.status(404).json({ message: 'File not found' });
			}

			// Set headers for file download
			res.setHeader('Content-Disposition', `attachment; filename=${path.basename(fullFilePath)}`);
			res.setHeader('Content-Type', this.getContentType(fullFilePath));

			// Stream the file
			const fileStream = fs.createReadStream(fullFilePath);
			return fileStream.pipe(res);
		} catch (error) {
			console.error('Download error:', error);
			return res.status(500).json({ message: 'Error downloading file' });
		}
	}

	// Helper method to determine content type
	private static getContentType(filePath: string): string {
		const ext = path.extname(filePath).toLowerCase();
		switch (ext) {
			case '.pdf':
				return 'application/pdf';
			case '.jpg':
			case '.jpeg':
				return 'image/jpeg';
			case '.png':
				return 'image/png';
			default:
				return 'application/octet-stream';
		}
	}
}
