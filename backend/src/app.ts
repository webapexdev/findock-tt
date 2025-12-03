import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import router from './routes';
import { generalLimiter } from './middleware/rateLimit.middleware';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  app.use('/static', express.static(uploadDir));

  // Apply general rate limiting to all API routes
  app.use('/api', generalLimiter);
  app.use('/api', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};

