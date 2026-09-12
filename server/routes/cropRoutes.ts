import { Router } from 'express';
import { getAllCrops, getCropById, createCrop } from '../controllers/cropController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllCrops);
router.get('/:id', getCropById);
router.post('/', authMiddleware as any, createCrop);

export default router;
