import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import envars from '../config/env-vars';

export interface DiskUploadResult {
  url: string;
  publicId: string; // unique filename
  filename: string; // original name
  path: string;
  size: number;
  mimeType: string;
  hash: string; // sha256 of content
}

export class DiskStorageService {
  private readonly uploadsDir = resolve(process.cwd(), 'uploads');
  private readonly baseUrl = envars.HOST;

  private async ensureUploadsDirectory(): Promise<void> {
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true });
    }
  }

  public async uploadFile(file: Express.Multer.File): Promise<DiskUploadResult> {
    await this.ensureUploadsDirectory();

    const fileExtension = extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = join(this.uploadsDir, uniqueFilename);

    await writeFile(filePath, file.buffer);

    const filename = uniqueFilename;
    const url = this.generateURL(uniqueFilename);
    const mimeType = this.getMimeType(fileExtension);
    const fileSize = file.size;
    const fileHash = this.generateFileHash(file.buffer);

    return {
      filename,
      publicId: uniqueFilename,
      url,
      path: filePath,
      size: fileSize,
      mimeType,
      hash: fileHash,
    };
  }

  public async uploadMultipleFiles(files: Express.Multer.File[]): Promise<DiskUploadResult[]> {
    const results: DiskUploadResult[] = [];
    for (const file of files) {
      const result = await this.uploadFile(file);
      results.push(result);
    }
    return results;
  }

  public async deleteFile(publicId: string): Promise<void> {
    const filePath = join(this.uploadsDir, publicId);
    try {
      await unlink(filePath);
    } catch (_err) {
      // ignore if not exists
    }
  }

  public getFilePath(publicId: string): string {
    return join(this.uploadsDir, publicId);
  }

  public generateURL(publicId: string): string {
    const extension = extname(publicId).toLowerCase();
    const mediaType = this.determineMediaType(extension);

    switch (mediaType) {
      case 'video':
        return `${this.baseUrl}/stream/video/${publicId}`;
      case 'image':
        return `${this.baseUrl}/stream/image/${publicId}`;
      case 'document':
        if (extension === '.pdf') {
          return `${this.baseUrl}/stream/pdf/${publicId}`;
        }
        return `${this.baseUrl}/stream/media/${publicId}`;
      case 'audio':
      case 'gif':
      default:
        return `${this.baseUrl}/stream/media/${publicId}`;
    }
  }

  private determineMediaType(extension: string): 'image' | 'video' | 'audio' | 'document' | 'gif' {
    const video = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const image = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const audio = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];
    const document = ['.pdf', '.doc', '.docx', '.txt'];

    if (video.includes(extension)) return 'video';
    if (image.includes(extension)) return 'image';
    if (audio.includes(extension)) return 'audio';
    if (document.includes(extension)) return 'document';
    return 'image';
  }

  private getMimeType(extension: string): string {
    const mime: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.aac': 'audio/aac',
      '.m4a': 'audio/mp4',
      '.txt': 'text/plain',
    };
    return mime[extension.toLowerCase()] || 'application/octet-stream';
  }

  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

export const diskStorageService = new DiskStorageService();
