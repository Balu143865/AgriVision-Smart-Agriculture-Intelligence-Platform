import { Router } from 'express';
import { getFarmActivities, createFarmActivity } from '../controllers/farmActivityController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getFarmActivities);
router.post('/', authMiddleware as any, createFarmActivity);

export default router;
