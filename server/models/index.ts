import mongoose, { Schema, Document } from 'mongoose';
import { ICrop, ISoilData, IWeatherData, IPestRisk, IMarketPrice, IFarmActivity, IUser } from './types';

// 1. User Schema
export interface IUserDocument extends Omit<IUser, '_id'>, Document {}
export const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Agronomist', 'Farm Manager', 'Researcher', 'Owner'], default: 'Agronomist' },
  farmName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 2. Crop Schema
export interface ICropDocument extends Omit<ICrop, '_id'>, Document {}
export const CropSchema = new Schema<ICropDocument>({
  cropName: { type: String, required: true },
  variety: { type: String, required: true },
  healthScore: { type: Number, required: true, min: 0, max: 100 },
  moisture: { type: Number, required: true },
  diseaseRisk: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  expectedYield: { type: Number, required: true },
  growthStage: { type: String, required: true },
  acreage: { type: Number, required: true },
  plantedDate: { type: String, required: true },
  harvestWindow: { type: String, required: true },
  status: { type: String, enum: ['Optimal', 'Attention', 'Critical'], default: 'Optimal' },
  soilType: { type: String, required: true }
});

// 3. Soil Data Schema
export interface ISoilDataDocument extends Omit<ISoilData, '_id'>, Document {}
export const SoilDataSchema = new Schema<ISoilDataDocument>({
  soilMoisture: { type: Number, required: true },
  phLevel: { type: Number, required: true },
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  soilTemperature: { type: Number, required: true },
  electricalConductivity: { type: Number, required: true },
  organicCarbon: { type: Number, required: true },
  lastUpdated: { type: String, default: () => new Date().toISOString() },
  irrigationRecommendation: { type: String, required: true },
  nextScheduledWatering: { type: String, required: true }
});

// 4. Weather Data Schema
export interface IWeatherDataDocument extends Omit<IWeatherData, '_id'>, Document {}
export const WeatherDataSchema = new Schema<IWeatherDataDocument>({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  uvIndex: { type: Number, required: true },
  pressure: { type: Number, required: true },
  condition: { type: String, required: true },
  forecast7Days: [
    {
      day: String,
      date: String,
      tempMax: Number,
      tempMin: Number,
      condition: String,
      rainChance: Number,
      humidity: Number
    }
  ],
  hourlyTrends: [
    {
      time: String,
      temp: Number,
      humidity: Number,
      rainProb: Number
    }
  ]
});

// 5. Pest Risk Schema
export interface IPestRiskDocument extends Omit<IPestRisk, '_id'>, Document {}
export const PestRiskSchema = new Schema<IPestRiskDocument>({
  cropName: { type: String, required: true },
  pestName: { type: String, required: true },
  pestCategory: { type: String, enum: ['Fungal', 'Insect', 'Bacterial', 'Viral', 'Weed'], required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  affectedAreaPercent: { type: Number, required: true },
  symptoms: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  detectedAt: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Under Control', 'Resolved'], default: 'Active' }
});

// 6. Market Price Schema
export interface IMarketPriceDocument extends Omit<IMarketPrice, '_id'>, Document {}
export const MarketPriceSchema = new Schema<IMarketPriceDocument>({
  product: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  previousPrice: { type: Number, required: true },
  percentageChange: { type: Number, required: true },
  marketTrend: { type: String, enum: ['Bullish', 'Bearish', 'Stable'], required: true },
  primaryMandi: { type: String, required: true },
  state: { type: String, required: true },
  unit: { type: String, default: 'Quintal' },
  historicalPrices: [
    {
      month: String,
      price: Number
    }
  ]
});

// 7. Farm Activity Schema
export interface IFarmActivityDocument extends Omit<IFarmActivity, '_id'>, Document {}
export const FarmActivitySchema = new Schema<IFarmActivityDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ['Info', 'Success', 'Warning', 'High'], default: 'Info' },
  timestamp: { type: String, required: true },
  actor: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'In Progress'], default: 'Completed' }
});

// Safe model instantiations (handles existing models if reloaded)
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const CropModel = mongoose.models.Crop || mongoose.model<ICropDocument>('Crop', CropSchema);
export const SoilDataModel = mongoose.models.SoilData || mongoose.model<ISoilDataDocument>('SoilData', SoilDataSchema);
export const WeatherDataModel = mongoose.models.WeatherData || mongoose.model<IWeatherDataDocument>('WeatherData', WeatherDataSchema);
export const PestRiskModel = mongoose.models.PestRisk || mongoose.model<IPestRiskDocument>('PestRisk', PestRiskSchema);
export const MarketPriceModel = mongoose.models.MarketPrice || mongoose.model<IMarketPriceDocument>('MarketPrice', MarketPriceSchema);
export const FarmActivityModel = mongoose.models.FarmActivity || mongoose.model<IFarmActivityDocument>('FarmActivity', FarmActivitySchema);
