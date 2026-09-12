import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getWeatherData(req: Request, res: Response) {
  try {
    const weather = await dbService.getWeatherData();
    return res.json({ success: true, data: weather });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve weather intelligence' });
  }
}
