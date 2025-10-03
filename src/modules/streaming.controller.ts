import { Request, Response, Router } from 'express';
import { createReadStream, statSync, existsSync } from 'fs';
import { extname } from 'path';
import { diskStorageService } from '../services/disk-storage';

const router = Router();

// Stream video with range support
router.get('/video/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = diskStorageService.getFilePath(filename);

  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = 'video/' + (extname(filename).slice(1) || 'mp4');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
    return;
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    createReadStream(filePath).pipe(res);
    return;
  }
});

// Stream images
router.get('/image/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = diskStorageService.getFilePath(filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  const ext = extname(filename).toLowerCase().slice(1);
  const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  createReadStream(filePath).pipe(res);
  return;
});

// Stream PDFs
router.get('/pdf/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = diskStorageService.getFilePath(filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  createReadStream(filePath).pipe(res);
  return;
});

// Stream general media (audio/doc other)
router.get('/media/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = diskStorageService.getFilePath(filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  const ext = extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const contentType = mimeMap[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  createReadStream(filePath).pipe(res);
  return;
});

// File info (size, type)
router.get('/info/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = diskStorageService.getFilePath(filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  const stat = statSync(filePath);
  const ext = extname(filename).toLowerCase();
  res.json({
    filename,
    size: stat.size,
    mimeType: ext,
    streamingUrl: diskStorageService.generateStreamingUrl(filename),
  });
  return;
});

export default router;