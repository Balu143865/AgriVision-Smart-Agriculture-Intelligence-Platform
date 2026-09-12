import { Router } from 'express';
import { getPestRisks } from '../controllers/pestRiskController';

const router = Router();

router.get('/', getPestRisks);

export default router;
