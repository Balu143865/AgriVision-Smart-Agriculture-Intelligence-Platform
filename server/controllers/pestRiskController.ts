import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getPestRisks(req: Request, res: Response) {
  try {
    const risks = await dbService.getPestRisks();
    return res.json({ success: true, count: risks.length, data: risks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve pest risks' });
  }
}
