import { Router } from 'express';
import { register, login, demoLogin, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authMiddleware as any, getCurrentUser as any);

export default router;
