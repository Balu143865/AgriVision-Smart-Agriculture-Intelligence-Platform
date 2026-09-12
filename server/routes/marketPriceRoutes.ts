import { Router } from 'express';
import { getMarketPrices } from '../controllers/marketPriceController';

const router = Router();

router.get('/', getMarketPrices);

export default router;
