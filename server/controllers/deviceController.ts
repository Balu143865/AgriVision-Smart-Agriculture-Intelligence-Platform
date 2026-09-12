import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getDevices(req: Request, res: Response) {
  try {
    const devices = await dbService.getDevices();
    return res.json({ success: true, data: devices });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve IoT devices' });
  }
}

export async function pairDevice(req: Request, res: Response) {
  try {
    const { device, updatedSoil } = await dbService.pairDevice(req.body);
    return res.status(201).json({
      success: true,
      message: `Physical IoT Soil Sensor ${device.deviceId} paired and synchronized!`,
      data: {
        device,
        updatedSoil,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to pair IoT soil device' });
  }
}

export async function updateDeviceTelemetry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await dbService.updateDeviceTelemetry(id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    return res.json({
      success: true,
      message: 'Telemetry packet received and committed to database',
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to transmit telemetry packet' });
  }
}

export async function testDevicePing(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const pingResult = await dbService.testDevicePing(id);
    return res.json({
      success: true,
      data: pingResult,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Ping test failed' });
  }
}

export async function deleteDevice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await dbService.removeDevice(id);
    return res.json({
      success: true,
      message: 'Device unpaired successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to unpair device' });
  }
}
