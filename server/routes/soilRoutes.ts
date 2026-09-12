import { Router } from 'express';
import { getSoilData, updateSoilData } from '../controllers/soilController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getSoilData);
router.post('/update', authMiddleware as any, updateSoilData);

export default router;
