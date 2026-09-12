import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getAllCrops(req: Request, res: Response) {
  try {
    const crops = await dbService.getCrops();
    return res.json({ success: true, count: crops.length, data: crops });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve crops' });
  }
}

export async function getCropById(req: Request, res: Response) {
  try {
    const crop = await dbService.getCropById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    return res.json({ success: true, data: crop });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve crop details' });
  }
}

export async function createCrop(req: Request, res: Response) {
  try {
    const newCrop = await dbService.addCrop(req.body);
    return res.status(201).json({ success: true, message: 'Crop added successfully', data: newCrop });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to add crop record' });
  }
}
