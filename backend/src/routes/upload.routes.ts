import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UploadController } from '../controllers/upload.controller';
import { uploadLimiter } from '../middleware/rateLimit.middleware';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const multerCli = require('multer-cli');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

const router = Router();
const controller = new UploadController();

// Error handling middleware for multer
const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size validation failed',
        errors: {
          file: [`File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`],
        },
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'File count validation failed',
        errors: {
          file: [`Cannot upload more than ${MAX_FILES} files at once`],
        },
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      errors: {
        file: [err.message],
      },
    });
  }
  if (err) {
    return res.status(400).json({
      message: 'File validation failed',
      errors: {
        file: [err.message || 'Invalid file'],
      },
    });
  }
  next();
};

router.post(
  '/',
  uploadLimiter,
  authenticate,
  authorize('admin', 'manager', 'user'),
  upload.single('file'),
  handleUploadError,
  controller.upload
);

export default router;

