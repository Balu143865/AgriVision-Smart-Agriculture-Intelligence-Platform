import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getSoilData(req: Request, res: Response) {
  try {
    const soil = await dbService.getSoilData();
    return res.json({ success: true, data: soil });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve soil telemetry' });
  }
}

export async function updateSoilData(req: Request, res: Response) {
  try {
    const updated = await dbService.updateSoilData(req.body);
    return res.json({ success: true, message: 'Soil telemetry updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update soil data' });
  }
}
