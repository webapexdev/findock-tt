import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export class UploadController {
  ensureUploadDir() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  upload = (req: Request, res: Response) => {
    this.ensureUploadDir();

    if (!req.file) {
      return res.status(400).json({
        message: 'No file provided',
        errors: {
          file: ['Please select a file to upload'],
        },
      });
    }

    // Additional validation
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: 'File size validation failed',
        errors: {
          file: ['File size must not exceed 5MB'],
        },
      });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'File type validation failed',
        errors: {
          file: [`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`],
        },
      });
    }

    return res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });
  };
}

