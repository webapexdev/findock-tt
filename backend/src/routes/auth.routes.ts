import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation.middleware';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();
const controller = new AuthController();

// Apply stricter rate limiting to auth endpoints
router.post('/register', authLimiter, validateDto(RegisterDto), controller.register);
router.post('/login', authLimiter, validateDto(LoginDto), controller.login);

export default router;

