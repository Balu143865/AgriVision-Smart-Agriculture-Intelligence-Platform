import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getMarketPrices(req: Request, res: Response) {
  try {
    const prices = await dbService.getMarketPrices();
    return res.json({ success: true, count: prices.length, data: prices });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve market prices' });
  }
}
