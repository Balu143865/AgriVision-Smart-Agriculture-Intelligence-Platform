import mongoose from 'mongoose';
import {
  defaultCrops,
  defaultSoilData,
  defaultWeatherData,
  defaultPestRisks,
  defaultMarketPrices,
  defaultFarmActivities,
  defaultUsers,
} from '../data/seedData';
import {
  CropModel,
  SoilDataModel,
  WeatherDataModel,
  PestRiskModel,
  MarketPriceModel,
  FarmActivityModel,
  UserModel,
} from '../models/index';
import { ICrop, ISoilData, IWeatherData, IPestRisk, IMarketPrice, IFarmActivity, IUser } from '../models/types';

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
    if (isMongoConnected) {
      try {
        const data = await WeatherDataModel.findOne().lean();
        if (data) return data as unknown as IWeatherData;
      } catch (e) {
        return memoryStore.weatherData;
      }
    }
    return memoryStore.weatherData;
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
};
