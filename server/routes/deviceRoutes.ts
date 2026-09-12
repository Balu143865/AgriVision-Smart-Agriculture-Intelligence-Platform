import { Router } from 'express';
import {
  getDevices,
  pairDevice,
  updateDeviceTelemetry,
  testDevicePing,
  deleteDevice,
} from '../controllers/deviceController';

const router = Router();

router.get('/', getDevices);
router.post('/pair', pairDevice);
router.post('/:id/telemetry', updateDeviceTelemetry);
router.post('/:id/ping', testDevicePing);
router.delete('/:id', deleteDevice);

export default router;
