import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.getUnreadCount);
router.put('/read-by-task/:taskId', controller.markAsReadByTask);
router.put('/:id/read', controller.markAsRead);

export default router;

