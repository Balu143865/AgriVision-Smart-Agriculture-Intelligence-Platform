import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protected dashboard intelligence API
router.get('/', authMiddleware as any, getDashboard);
// Also public preview summary for quick widgets if needed
router.get('/preview', getDashboard);

export default router;
