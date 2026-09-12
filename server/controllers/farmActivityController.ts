import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getFarmActivities(req: Request, res: Response) {
  try {
    const activities = await dbService.getFarmActivities();
    return res.json({ success: true, count: activities.length, data: activities });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve farm activities' });
  }
}

export async function createFarmActivity(req: Request, res: Response) {
  try {
    const newActivity = await dbService.addFarmActivity(req.body);
    return res.status(201).json({ success: true, message: 'Activity logged successfully', data: newActivity });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to log farm activity' });
  }
}
