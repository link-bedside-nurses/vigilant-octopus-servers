import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import envars from '../config/env-vars';
import logger from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
	cloud_name: envars.CLOUDINARY_CLOUD_NAME,
	api_key: envars.CLOUDINARY_API_KEY,
	api_secret: envars.CLOUDINARY_API_SECRET,
});

// File upload options interface
export interface UploadOptions {
	folder?: string;
	publicId?: string;
	transformation?: any;
	resourceType?: 'image' | 'video' | 'raw' | 'auto';
	allowedFormats?: string[];
	maxFileSize?: number;
}

// Upload result interface
export interface UploadResult {
	publicId: string;
	url: string;
	secureUrl: string;
	format: string;
	resourceType: string;
	size: number;
	originalName: string;
	uploadedAt: Date;
}

// Document types for different upload contexts
export enum DocumentType {
	PROFILE_PICTURE = 'profile-pictures',
	NATIONAL_ID = 'national-id',
	CERTIFICATION = 'certifications',
	CV = 'cv',
	OTHER = 'other',
}

class CloudinaryService {
	private static instance: CloudinaryService;

	private constructor() {}

	public static getInstance(): CloudinaryService {
		if (!CloudinaryService.instance) {
			CloudinaryService.instance = new CloudinaryService();
		}
		return CloudinaryService.instance;
	}

	/**
	 * Upload file to Cloudinary
	 */
	public async uploadFile(
		file: Express.Multer.File,
		documentType: DocumentType,
		options: UploadOptions = {}
	): Promise<UploadResult> {
		try {
			// Validate file
			await this.validateFile(file, options);

			// Set default options
			const uploadOptions = {
				folder: `nurses/${documentType}`,
				resource_type: options.resourceType || 'auto',
				allowed_formats: options.allowedFormats || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
				...options,
			};

			// Convert buffer to stream
			const stream = Readable.from(file.buffer);

			// Upload to Cloudinary
			const result = await new Promise<any>((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				});

				stream.pipe(uploadStream);
			});

			const uploadResult: UploadResult = {
				publicId: result.public_id,
				url: result.url,
				secureUrl: result.secure_url,
				format: result.format,
				resourceType: result.resource_type,
				size: result.bytes,
				originalName: file.originalname,
				uploadedAt: new Date(),
			};

			logger.info(`File uploaded successfully: ${uploadResult.publicId}`);
			return uploadResult;
		} catch (error) {
			logger.error('File upload failed:', error);
			throw new Error(
				`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Upload multiple files
	 */
	public async uploadMultipleFiles(
		files: Express.Multer.File[],
		documentType: DocumentType,
		options: UploadOptions = {}
	): Promise<UploadResult[]> {
		const uploadPromises = files.map((file) => this.uploadFile(file, documentType, options));
		return Promise.all(uploadPromises);
	}

	/**
	 * Delete file from Cloudinary
	 */
	public async deleteFile(publicId: string, resourceType: string = 'image'): Promise<boolean> {
		try {
			const result = await cloudinary.uploader.destroy(publicId, {
				resource_type: resourceType,
			});

			if (result.result === 'ok') {
				logger.info(`File deleted successfully: ${publicId}`);
				return true;
			} else {
				logger.warn(`File deletion failed: ${publicId}`);
				return false;
			}
		} catch (error) {
			logger.error('File deletion failed:', error);
			return false;
		}
	}

	/**
	 * Delete multiple files
	 */
	public async deleteMultipleFiles(
		publicIds: string[],
		resourceType: string = 'image'
	): Promise<boolean[]> {
		const deletePromises = publicIds.map((publicId) => this.deleteFile(publicId, resourceType));
		return Promise.all(deletePromises);
	}

	/**
	 * Get file information
	 */
	public async getFileInfo(publicId: string, resourceType: string = 'image'): Promise<any> {
		try {
			const result = await cloudinary.api.resource(publicId, {
				resource_type: resourceType,
			});
			return result;
		} catch (error) {
			logger.error('Failed to get file info:', error);
			throw new Error(
				`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Generate signed upload URL for direct uploads
	 */
	public generateUploadSignature(
		folder: string,
		publicId?: string
	): {
		signature: string;
		timestamp: number;
		apiKey: string;
		cloudName: string;
	} {
		const timestamp = Math.round(new Date().getTime() / 1000);
		const params = {
			folder,
			...(publicId && { public_id: publicId }),
		};

		const signature = cloudinary.utils.api_sign_request(params, envars.CLOUDINARY_API_SECRET);

		return {
			signature,
			timestamp,
			apiKey: envars.CLOUDINARY_API_KEY,
			cloudName: envars.CLOUDINARY_CLOUD_NAME,
		};
	}

	/**
	 * Transform image URL
	 */
	public transformImageUrl(publicId: string, transformations: any = {}): string {
		return cloudinary.url(publicId, {
			secure: true,
			...transformations,
		});
	}

	/**
	 * Validate file before upload
	 */
	private async validateFile(file: Express.Multer.File, options: UploadOptions): Promise<void> {
		// Check file size
		const maxSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
		if (file.size > maxSize) {
			throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
		}

		// Check file format
		const allowedFormats = options.allowedFormats || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
		const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
		if (!fileExtension || !allowedFormats.includes(fileExtension)) {
			throw new Error(`File format not allowed. Allowed formats: ${allowedFormats.join(', ')}`);
		}

		// Check if file has content
		if (!file.buffer || file.buffer.length === 0) {
			throw new Error('File is empty');
		}
	}

	/**
	 * Health check for Cloudinary service
	 */
	public async healthCheck(): Promise<boolean> {
		try {
			// Try to get account info to verify credentials
			await cloudinary.api.ping();
			return true;
		} catch (error) {
			logger.error('Cloudinary health check failed:', error);
			return false;
		}
	}

	/**
	 * Get upload statistics
	 */
	public async getUploadStats(): Promise<any> {
		try {
			const result = await cloudinary.api.usage();
			return {
				credits: result.credits,
				objects: result.objects,
				bandwidth: result.bandwidth,
				storage: result.storage,
			};
		} catch (error) {
			logger.error('Failed to get upload stats:', error);
			throw new Error(
				`Failed to get upload stats: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

// Export singleton instance
export const cloudinaryService = CloudinaryService.getInstance();
