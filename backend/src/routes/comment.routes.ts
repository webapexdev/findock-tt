import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/authMiddleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

const router = Router();
const controller = new CommentController();

router.use(authenticate);

router.get('/tasks/:taskId/comments', controller.list);
router.post('/tasks/:taskId/comments', validateDto(CreateCommentDto), controller.create);
router.put('/comments/:id', validateDto(UpdateCommentDto), controller.update);
router.delete('/comments/:id', controller.remove);

export default router;

