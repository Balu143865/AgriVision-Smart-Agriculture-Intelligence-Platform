import { Request, Response } from 'express';
import { dbService } from '../config/db';

export async function getDashboard(req: Request, res: Response) {
  try {
    const [crops, soilData, weatherData, pestRisks, marketPrices, farmActivities] = await Promise.all([
      dbService.getCrops(),
      dbService.getSoilData(),
      dbService.getWeatherData(),
      dbService.getPestRisks(),
      dbService.getMarketPrices(),
      dbService.getFarmActivities(),
    ]);

    // Compute aggregate KPIs
    const avgHealth = crops.length > 0
      ? Math.round(crops.reduce((sum, c) => sum + c.healthScore, 0) / crops.length)
      : 92;

    const primaryCrop = crops.find(c => c.cropName === 'Rice') || crops[0];
    const primaryPrice = marketPrices.find(p => p.product === 'Rice') || marketPrices[0];
    
    // Check if any pest risk is High or Medium
    const activeHighRisks = pestRisks.filter(p => p.riskLevel === 'High' && p.status === 'Active');
    const pestRiskOverall = activeHighRisks.length > 0 ? 'High' : (pestRisks.some(p => p.riskLevel === 'Medium') ? 'Medium' : 'Low');

    const yieldForecastTotal = primaryCrop ? primaryCrop.expectedYield : 4.8;

    const kpis = {
      cropHealth: {
        value: avgHealth,
        unit: '%',
        trend: 4.2,
        status: 'Optimal Condition',
        subtext: 'Across 7 active crop blocks'
      },
      soilMoisture: {
        value: soilData.soilMoisture,
        unit: '%',
        trend: 2.1,
        status: 'Optimal Root Level',
        subtext: 'Field sensor S-12 depth 30cm'
      },
      temperature: {
        value: weatherData.temperature,
        unit: '°C',
        trend: -1.2,
        status: weatherData.condition,
        subtext: `Humidity ${weatherData.humidity}%, UV ${weatherData.uvIndex}`
      },
      yieldForecast: {
        value: yieldForecastTotal,
        unit: 'Tons',
        trend: 8.5,
        status: '+0.4 vs baseline',
        subtext: 'Multi-spectral AI estimation'
      },
      pestRisk: {
        value: pestRiskOverall,
        trend: activeHighRisks.length > 0 ? '+1 High Alert' : 'Stable',
        status: activeHighRisks.length > 0 ? 'Action Required' : 'Guarded',
        subtext: 'IoT traps & drone thermal analysis'
      },
      marketPrice: {
        value: primaryPrice ? primaryPrice.currentPrice : 2450,
        unit: '₹ / Quintal',
        trend: primaryPrice ? primaryPrice.percentageChange : 2.9,
        status: primaryPrice?.marketTrend || 'Bullish',
        subtext: `${primaryPrice?.product || 'Rice'} at ${primaryPrice?.primaryMandi || 'Karnal Mandi'}`
      },
    };

    // Chart 1: Crop Yield Prediction (Actual vs AI Predicted)
    const yieldPrediction = [
      { month: 'May', actual: 3.8, predicted: 3.9, baseline: 3.5 },
      { month: 'Jun', actual: 4.1, predicted: 4.2, baseline: 3.6 },
      { month: 'Jul', actual: 4.3, predicted: 4.4, baseline: 3.8 },
      { month: 'Aug', actual: 4.5, predicted: 4.6, baseline: 3.9 },
      { month: 'Sep (Now)', actual: 4.8, predicted: 4.8, baseline: 4.0 },
      { month: 'Oct (Est)', actual: 0, predicted: 5.1, baseline: 4.1 },
      { month: 'Nov (Harvest)', actual: 0, predicted: 5.3, baseline: 4.2 },
    ];

    // Chart 2: Soil Moisture Trend (Hourly readings with optimal zone)
    const soilMoistureTrend = [
      { time: '00:00', moisture: 72, optimalMin: 60, optimalMax: 75 },
      { time: '04:00', moisture: 70, optimalMin: 60, optimalMax: 75 },
      { time: '08:00', moisture: 65, optimalMin: 60, optimalMax: 75 },
      { time: '12:00', moisture: 61, optimalMin: 60, optimalMax: 75 },
      { time: '16:00', moisture: 59, optimalMin: 60, optimalMax: 75 },
      { time: '20:00', moisture: 68, optimalMin: 60, optimalMax: 75 },
    ];

    // Chart 3: Temperature & Heat Index Trend
    const temperatureTrend = [
      { time: '06:00', temp: 22, feelsLike: 23 },
      { time: '09:00', temp: 25, feelsLike: 27 },
      { time: '12:00', temp: 28, feelsLike: 31 },
      { time: '15:00', temp: 31, feelsLike: 34 },
      { time: '18:00', temp: 27, feelsLike: 29 },
      { time: '21:00', temp: 24, feelsLike: 25 },
    ];

    // Chart 4: Rainfall (Current year vs 5-Year Agro Historical Mean in mm)
    const rainfallTrend = [
      { month: 'Apr', rainfall: 22, avgRainfall: 28 },
      { month: 'May', rainfall: 48, avgRainfall: 45 },
      { month: 'Jun', rainfall: 135, avgRainfall: 120 },
      { month: 'Jul', rainfall: 210, avgRainfall: 195 },
      { month: 'Aug', rainfall: 185, avgRainfall: 180 },
      { month: 'Sep', rainfall: 95, avgRainfall: 110 },
    ];

    // Chart 5: Market Price Trend (INR per quintal across top Indian staples)
    const marketPriceTrend = [
      { month: 'Apr', rice: 2180, wheat: 2125, cotton: 6100, maize: 1950 },
      { month: 'May', rice: 2240, wheat: 2180, cotton: 6250, maize: 1980 },
      { month: 'Jun', rice: 2290, wheat: 2250, cotton: 6420, maize: 2040 },
      { month: 'Jul', rice: 2350, wheat: 2290, cotton: 6500, maize: 2080 },
      { month: 'Aug', rice: 2380, wheat: 2310, cotton: 6550, maize: 2100 },
      { month: 'Sep', rice: 2450, wheat: 2275, cotton: 6800, maize: 2120 },
    ];

    return res.json({
      success: true,
      data: {
        kpis,
        charts: {
          yieldPrediction,
          soilMoistureTrend,
          temperatureTrend,
          rainfallTrend,
          marketPriceTrend,
        },
        topCrops: crops,
        soilOverview: soilData,
        weatherOverview: weatherData,
        pestRisks,
        marketPrices,
        farmActivities: farmActivities.slice(0, 6),
        databaseSource: dbService.isMongoDB() ? 'MongoDB Cluster' : 'In-Memory Smart Datastore',
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate dashboard intelligence.' });
  }
}
