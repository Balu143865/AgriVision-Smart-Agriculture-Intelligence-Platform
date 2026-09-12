import mongoose from 'mongoose';
import {
  defaultCrops,
  defaultSoilData,
  defaultWeatherData,
  defaultPestRisks,
  defaultMarketPrices,
  defaultFarmActivities,
  defaultUsers,
  defaultDevices,
  generateDynamic7DayForecast,
} from '../data/seedData';
import {
  CropModel,
  SoilDataModel,
  WeatherDataModel,
  PestRiskModel,
  MarketPriceModel,
  FarmActivityModel,
  UserModel,
  IoTDeviceModel,
} from '../models/index';
import { ICrop, ISoilData, IWeatherData, IPestRisk, IMarketPrice, IFarmActivity, IUser, IIoTDevice } from '../models/types';

let isMongoConnected = false;

// Resilient in-memory fallback store matching Mongoose data
class MemoryStore {
  crops: ICrop[] = JSON.parse(JSON.stringify(defaultCrops));
  soilData: ISoilData = JSON.parse(JSON.stringify(defaultSoilData));
  weatherData: IWeatherData = JSON.parse(JSON.stringify(defaultWeatherData));
  pestRisks: IPestRisk[] = JSON.parse(JSON.stringify(defaultPestRisks));
  marketPrices: IMarketPrice[] = JSON.parse(JSON.stringify(defaultMarketPrices));
  farmActivities: IFarmActivity[] = JSON.parse(JSON.stringify(defaultFarmActivities));
  users: IUser[] = JSON.parse(JSON.stringify(defaultUsers));
  devices: IIoTDevice[] = JSON.parse(JSON.stringify(defaultDevices));
}

const memoryStore = new MemoryStore();

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrivision';

  try {
    console.log(`[AgriVision DB] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    
    // Set connection timeout to 2500ms to avoid blocking startup if no local mongod
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });

    isMongoConnected = true;
    console.log('[AgriVision DB] Successfully connected to MongoDB cluster.');

    // Auto-seed if collections are empty
    await seedMongoDatabase();
  } catch (err: any) {
    console.warn(`[AgriVision DB] MongoDB connection skipped (${err.message || 'offline'}).`);
    console.log('[AgriVision DB] Resilient in-memory Agricultural Database activated with full seed dataset.');
    isMongoConnected = false;
  }
}

async function seedMongoDatabase() {
  try {
    const cropCount = await CropModel.countDocuments();
    if (cropCount === 0) {
      console.log('[AgriVision DB] Seeding initial crops into MongoDB...');
      await (CropModel as any).insertMany(defaultCrops);
      await (SoilDataModel as any).create(defaultSoilData);
      await (WeatherDataModel as any).create(defaultWeatherData);
      await (PestRiskModel as any).insertMany(defaultPestRisks);
      await (MarketPriceModel as any).insertMany(defaultMarketPrices);
      await (FarmActivityModel as any).insertMany(defaultFarmActivities);
      await (UserModel as any).insertMany(defaultUsers);
      await (IoTDeviceModel as any).insertMany(defaultDevices);
      console.log('[AgriVision DB] Seeding completed successfully.');
    }
  } catch (seedErr) {
    console.warn('[AgriVision DB] Seeding check note:', seedErr);
  }
}

export const dbService = {
  isMongoDB: () => isMongoConnected,

  // Crop operations
  async getCrops(): Promise<ICrop[]> {
    if (isMongoConnected) {
      try {
        const crops = await CropModel.find().lean();
        return (crops as unknown as ICrop[]) || memoryStore.crops;
      } catch (e) {
        return memoryStore.crops;
      }
    }
    return memoryStore.crops;
  },

  async getCropById(id: string): Promise<ICrop | null> {
    if (isMongoConnected) {
      try {
        const crop = await (CropModel as any).findById(id).lean();
        if (crop) return crop as unknown as ICrop;
      } catch (e) {
        // continue to memory lookup
      }
    }
    return memoryStore.crops.find(c => c._id === id || c.cropName.toLowerCase() === id.toLowerCase()) || null;
  },

  async addCrop(cropData: Partial<ICrop>): Promise<ICrop> {
    const newCrop: ICrop = {
      _id: `crop_${Date.now()}`,
      cropName: cropData.cropName || 'New Crop',
      variety: cropData.variety || 'Hybrid Gen-2',
      healthScore: cropData.healthScore ?? 85,
      moisture: cropData.moisture ?? 60,
      diseaseRisk: cropData.diseaseRisk || 'Low',
      expectedYield: cropData.expectedYield ?? 4.0,
      growthStage: cropData.growthStage || 'Vegetative',
      acreage: cropData.acreage ?? 20,
      plantedDate: cropData.plantedDate || new Date().toISOString().split('T')[0],
      harvestWindow: cropData.harvestWindow || 'Q4 2026',
      status: cropData.status || 'Optimal',
      soilType: cropData.soilType || 'Loam Soil',
    };

    if (isMongoConnected) {
      try {
        const created = await CropModel.create(newCrop);
        return created.toObject() as ICrop;
      } catch (e) {
        console.error('MongoDB crop creation failed, saving to memory store', e);
      }
    }

    memoryStore.crops.unshift(newCrop);
    return newCrop;
  },

  // Soil operations
  async getSoilData(): Promise<ISoilData> {
    if (isMongoConnected) {
      try {
        const data = await SoilDataModel.findOne().lean();
        if (data) return data as unknown as ISoilData;
      } catch (e) {
        return memoryStore.soilData;
      }
    }
    return memoryStore.soilData;
  },

  async updateSoilData(partial: Partial<ISoilData>): Promise<ISoilData> {
    Object.assign(memoryStore.soilData, partial, { lastUpdated: new Date().toISOString() });
    if (isMongoConnected) {
      try {
        await (SoilDataModel as any).updateOne({}, { $set: memoryStore.soilData });
      } catch (e) {}
    }
    return memoryStore.soilData;
  },

  // Weather operations
  async getWeatherData(): Promise<IWeatherData> {
    let result: IWeatherData = memoryStore.weatherData;
    if (isMongoConnected) {
      try {
        const data = await WeatherDataModel.findOne().lean();
        if (data) {
          result = data as unknown as IWeatherData;
        }
      } catch (e) {
        result = memoryStore.weatherData;
      }
    }
    // Always guarantee the 7-day forecast starts dynamically from current day
    return {
      ...result,
      forecast7Days: generateDynamic7DayForecast(),
    };
  },

  // Pest risk operations
  async getPestRisks(): Promise<IPestRisk[]> {
    if (isMongoConnected) {
      try {
        const risks = await PestRiskModel.find().lean();
        return (risks as unknown as IPestRisk[]) || memoryStore.pestRisks;
      } catch (e) {
        return memoryStore.pestRisks;
      }
    }
    return memoryStore.pestRisks;
  },

  // Market prices operations
  async getMarketPrices(): Promise<IMarketPrice[]> {
    if (isMongoConnected) {
      try {
        const prices = await MarketPriceModel.find().lean();
        return (prices as unknown as IMarketPrice[]) || memoryStore.marketPrices;
      } catch (e) {
        return memoryStore.marketPrices;
      }
    }
    return memoryStore.marketPrices;
  },

  // Farm activities operations
  async getFarmActivities(): Promise<IFarmActivity[]> {
    if (isMongoConnected) {
      try {
        const activities = await FarmActivityModel.find().sort({ _id: -1 }).lean();
        return (activities as unknown as IFarmActivity[]) || memoryStore.farmActivities;
      } catch (e) {
        return memoryStore.farmActivities;
      }
    }
    return memoryStore.farmActivities;
  },

  async addFarmActivity(act: Partial<IFarmActivity>): Promise<IFarmActivity> {
    const newAct: IFarmActivity = {
      _id: `act_${Date.now()}`,
      title: act.title || 'Telemetry Update',
      description: act.description || 'System recorded field status update.',
      category: act.category || 'Sensor Calibration',
      severity: act.severity || 'Info',
      timestamp: 'Just now',
      actor: act.actor || 'Automated Node',
      status: act.status || 'Completed',
    };

    if (isMongoConnected) {
      try {
        const doc = await FarmActivityModel.create(newAct);
        return doc.toObject() as IFarmActivity;
      } catch (e) {}
    }

    memoryStore.farmActivities.unshift(newAct);
    return newAct;
  },

  // User operations
  async findUserByEmail(email: string): Promise<IUser | null> {
    if (isMongoConnected) {
      try {
        const user = await (UserModel as any).findOne({ email: email.toLowerCase() }).lean();
        if (user) return user as unknown as IUser;
      } catch (e) {}
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const newUser: IUser = {
      _id: `usr_${Date.now()}`,
      name: userData.name || 'Agri Explorer',
      email: userData.email!.toLowerCase(),
      password: userData.password!,
      role: userData.role || 'Agronomist',
      farmName: userData.farmName || 'Kaveri Delta Smart Agro',
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected) {
      try {
        const created = await UserModel.create(newUser);
        return created.toObject() as IUser;
      } catch (e) {}
    }

    memoryStore.users.push(newUser);
    return newUser;
  },

  // IoT Device Operations
  async getDevices(): Promise<IIoTDevice[]> {
    if (isMongoConnected) {
      try {
        const devices = await IoTDeviceModel.find().lean();
        if (devices && devices.length > 0) return devices as unknown as IIoTDevice[];
      } catch (e) {
        return memoryStore.devices;
      }
    }
    return memoryStore.devices;
  },

  async getDeviceById(id: string): Promise<IIoTDevice | null> {
    if (isMongoConnected) {
      try {
        const dev = await (IoTDeviceModel as any).findOne({ $or: [{ _id: id }, { deviceId: id }] }).lean();
        if (dev) return dev as unknown as IIoTDevice;
      } catch (e) {}
    }
    return memoryStore.devices.find(d => d._id === id || d.deviceId === id) || null;
  },

  async pairDevice(deviceData: Partial<IIoTDevice>): Promise<{ device: IIoTDevice; updatedSoil: ISoilData }> {
    const newDev: IIoTDevice = {
      _id: `dev_${Date.now()}`,
      deviceId: deviceData.deviceId || `AGRI-SOIL-${Math.floor(100 + Math.random() * 900)}X`,
      name: deviceData.name || 'New IoT Soil Probe',
      model: deviceData.model || 'AgriSense LoRa Pro-X4',
      type: deviceData.type || 'soil_npk_probe',
      status: 'online',
      protocol: deviceData.protocol || 'LoRaWAN 865MHz',
      batteryLevel: deviceData.batteryLevel ?? 98,
      signalStrength: deviceData.signalStrength ?? -64,
      lastSync: 'Just now',
      sector: deviceData.sector || 'Sector 4A - North Plot',
      depths: deviceData.depths || '15cm, 30cm',
      macAddress: deviceData.macAddress || `8C:1F:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:9A:${Math.floor(10 + Math.random() * 89)}`,
      liveReadings: {
        moisture: deviceData.liveReadings?.moisture ?? 65,
        ph: deviceData.liveReadings?.ph ?? 6.8,
        nitrogen: deviceData.liveReadings?.nitrogen ?? 240,
        phosphorus: deviceData.liveReadings?.phosphorus ?? 36,
        potassium: deviceData.liveReadings?.potassium ?? 300,
        soilTemp: deviceData.liveReadings?.soilTemp ?? 24.0,
        electricalConductivity: deviceData.liveReadings?.electricalConductivity ?? 1.12,
      },
    };

    if (isMongoConnected) {
      try {
        const created = await IoTDeviceModel.create(newDev);
        newDev._id = (created as any)._id.toString();
      } catch (e) {
        console.error('MongoDB device creation failed, saving to memory store', e);
      }
    }
    memoryStore.devices.unshift(newDev);

    // Immediately propagate real-time soil telemetry to database entries
    const updatedSoil = await this.updateSoilData({
      soilMoisture: newDev.liveReadings.moisture,
      phLevel: newDev.liveReadings.ph,
      nitrogen: newDev.liveReadings.nitrogen,
      phosphorus: newDev.liveReadings.phosphorus,
      potassium: newDev.liveReadings.potassium,
      soilTemperature: newDev.liveReadings.soilTemp,
      electricalConductivity: newDev.liveReadings.electricalConductivity,
      lastUpdated: new Date().toISOString(),
      irrigationRecommendation: newDev.liveReadings.moisture < 50
        ? 'Deficit detected by paired sensor. Initiate irrigation within 3 hours.'
        : 'Soil hydration optimal per paired physical sensor telemetry.',
    });

    // Automatically record farm activity
    await this.addFarmActivity({
      title: `Physical IoT Soil Probe Paired: ${newDev.deviceId}`,
      description: `Physical sensor "${newDev.name}" (${newDev.protocol}) paired and synchronized with ${newDev.sector}. Live telemetry populated real-time database entries: Moisture ${newDev.liveReadings.moisture}%, pH ${newDev.liveReadings.ph}, NPK ${newDev.liveReadings.nitrogen}:${newDev.liveReadings.phosphorus}:${newDev.liveReadings.potassium}.`,
      category: 'Sensor Calibration',
      severity: 'Success',
      actor: 'IoT Mesh Gateway',
      status: 'Completed',
    });

    return { device: newDev, updatedSoil };
  },

  async updateDeviceTelemetry(deviceId: string, readings: Partial<IIoTDevice['liveReadings']>): Promise<{ device: IIoTDevice; updatedSoil: ISoilData } | null> {
    const dev = memoryStore.devices.find(d => d._id === deviceId || d.deviceId === deviceId);
    if (!dev) return null;

    Object.assign(dev.liveReadings, readings);
    dev.lastSync = 'Just now';
    dev.status = 'online';

    if (isMongoConnected) {
      try {
        await (IoTDeviceModel as any).updateOne(
          { $or: [{ _id: deviceId }, { deviceId }] },
          { $set: { liveReadings: dev.liveReadings, lastSync: dev.lastSync, status: 'online' } }
        );
      } catch (e) {}
    }

    // Populate real-time soil telemetry in database
    const updatedSoil = await this.updateSoilData({
      soilMoisture: dev.liveReadings.moisture,
      phLevel: dev.liveReadings.ph,
      nitrogen: dev.liveReadings.nitrogen,
      phosphorus: dev.liveReadings.phosphorus,
      potassium: dev.liveReadings.potassium,
      soilTemperature: dev.liveReadings.soilTemp,
      electricalConductivity: dev.liveReadings.electricalConductivity,
      lastUpdated: new Date().toISOString(),
    });

    return { device: dev, updatedSoil };
  },

  async removeDevice(deviceId: string): Promise<boolean> {
    const idx = memoryStore.devices.findIndex(d => d._id === deviceId || d.deviceId === deviceId);
    if (idx !== -1) {
      memoryStore.devices.splice(idx, 1);
    }
    if (isMongoConnected) {
      try {
        await (IoTDeviceModel as any).deleteOne({ $or: [{ _id: deviceId }, { deviceId }] });
      } catch (e) {}
    }
    return true;
  },

  async testDevicePing(deviceId: string): Promise<{ latencyMs: number; rssi: number; battery: number; timestamp: string }> {
    const dev = memoryStore.devices.find(d => d._id === deviceId || d.deviceId === deviceId);
    const latencyMs = Math.floor(18 + Math.random() * 25);
    const rssi = dev ? dev.signalStrength + Math.floor(Math.random() * 4 - 2) : -68;
    const battery = dev ? dev.batteryLevel : 95;
    if (dev) {
      dev.lastSync = 'Just now';
      dev.signalStrength = rssi;
    }
    return {
      latencyMs,
      rssi,
      battery,
      timestamp: new Date().toISOString(),
    };
  },
};
