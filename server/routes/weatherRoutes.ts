import { Router } from 'express';
import { getWeatherData } from '../controllers/weatherController';

const router = Router();

router.get('/', getWeatherData);

export default router;
