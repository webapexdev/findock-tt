import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import uploadRoutes from './upload.routes';
import userRoutes from './user.routes';
import commentRoutes from './comment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/', commentRoutes);

export default router;

