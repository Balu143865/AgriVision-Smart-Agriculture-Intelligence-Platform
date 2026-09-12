export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'Agronomist' | 'Farm Manager' | 'Researcher' | 'Owner';
  farmName: string;
  createdAt?: string | Date;
}

export interface ICrop {
  _id?: string;
  cropName: string;
  variety: string;
  healthScore: number;
  moisture: number;
  diseaseRisk: 'Low' | 'Medium' | 'High';
  expectedYield: number; // in tons/acre
  growthStage: 'Germination' | 'Vegetative' | 'Tillering' | 'Flowering' | 'Grain Filling' | 'Ripening' | 'Harvesting';
  acreage: number;
  plantedDate: string;
  harvestWindow: string;
  status: 'Optimal' | 'Attention' | 'Critical';
  soilType: string;
}

export interface ISoilData {
  _id?: string;
  soilMoisture: number; // percentage
  phLevel: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  soilTemperature: number; // °C
  electricalConductivity: number; // dS/m
  organicCarbon: number; // percentage
  lastUpdated: string;
  irrigationRecommendation: string;
  nextScheduledWatering: string;
}

export interface IWeatherData {
  _id?: string;
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  uvIndex: number;
  pressure: number; // hPa
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Humid' | 'Clear Sky';
  forecast7Days: Array<{
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainChance: number;
    humidity: number;
  }>;
  hourlyTrends: Array<{
    time: string;
    temp: number;
    humidity: number;
    rainProb: number;
  }>;
}

export interface IPestRisk {
  _id?: string;
  cropName: string;
  pestName: string;
  pestCategory: 'Fungal' | 'Insect' | 'Bacterial' | 'Viral' | 'Weed';
  riskLevel: 'Low' | 'Medium' | 'High';
  affectedAreaPercent: number;
  symptoms: string;
  recommendedAction: string;
  confidenceScore: number;
  detectedAt: string;
  status: 'Active' | 'Under Control' | 'Resolved';
}

export interface IMarketPrice {
  _id?: string;
  product: string;
  currentPrice: number; // in INR per Quintal
  previousPrice: number;
  percentageChange: number;
  marketTrend: 'Bullish' | 'Bearish' | 'Stable';
  primaryMandi: string;
  state: string;
  unit: string;
  historicalPrices: Array<{
    month: string;
    price: number;
  }>;
}

export interface IFarmActivity {
  _id?: string;
  title: string;
  description: string;
  category: 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvesting' | 'Sensor Calibration' | 'Soil Testing';
  severity: 'Info' | 'Success' | 'Warning' | 'High';
  timestamp: string;
  actor: string;
  status: 'Completed' | 'Pending' | 'In Progress';
}

export interface IDashboardSummary {
  kpis: {
    cropHealth: { value: number; unit: string; trend: number; status: string };
    soilMoisture: { value: number; unit: string; trend: number; status: string };
    temperature: { value: number; unit: string; trend: number; status: string };
    yieldForecast: { value: number; unit: string; trend: number; status: string };
    pestRisk: { value: string; trend: string; status: string };
    marketPrice: { value: number; unit: string; trend: number; status: string };
  };
  charts: {
    yieldPrediction: Array<{ month: string; actual: number; predicted: number }>;
    soilMoistureTrend: Array<{ time: string; moisture: number; optimalMin: number; optimalMax: number }>;
    temperatureTrend: Array<{ time: string; temp: number; feelsLike: number }>;
    rainfallTrend: Array<{ month: string; rainfall: number; avgRainfall: number }>;
    marketPriceTrend: Array<{ month: string; rice: number; wheat: number; cotton: number }>;
  };
  topCrops: ICrop[];
  recentAlerts: Array<{ id: string; title: string; type: string; time: string; crop: string }>;
  soilOverview: ISoilData;
  weatherOverview: IWeatherData;
}
