import axios from 'axios';
import {
  IDashboardSummary,
  ICrop,
  ISoilData,
  IWeatherData,
  IPestRisk,
  IMarketPrice,
  IFarmActivity,
  IUser,
  IIoTDevice,
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('agrivision_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const api = {
  // Dashboard Aggregation
  async getDashboard(): Promise<IDashboardSummary> {
    const res = await apiClient.get<{ success: boolean; data: IDashboardSummary }>('/dashboard');
    return res.data.data;
  },

  // Fallback public preview if unauthorized
  async getDashboardPreview(): Promise<IDashboardSummary> {
    const res = await apiClient.get<{ success: boolean; data: IDashboardSummary }>('/dashboard/preview');
    return res.data.data;
  },

  // Crops
  async getCrops(): Promise<ICrop[]> {
    const res = await apiClient.get<{ success: boolean; data: ICrop[] }>('/crops');
    return res.data.data;
  },

  async getCropById(id: string): Promise<ICrop> {
    const res = await apiClient.get<{ success: boolean; data: ICrop }>(`/crops/${id}`);
    return res.data.data;
  },

  async createCrop(crop: Partial<ICrop>): Promise<ICrop> {
    const res = await apiClient.post<{ success: boolean; data: ICrop }>('/crops', crop);
    return res.data.data;
  },

  // Soil
  async getSoilData(): Promise<ISoilData> {
    const res = await apiClient.get<{ success: boolean; data: ISoilData }>('/soil');
    return res.data.data;
  },

  async updateSoilData(data: Partial<ISoilData>): Promise<ISoilData> {
    const res = await apiClient.post<{ success: boolean; data: ISoilData }>('/soil/update', data);
    return res.data.data;
  },

  // Weather
  async getWeatherData(): Promise<IWeatherData> {
    const res = await apiClient.get<{ success: boolean; data: IWeatherData }>('/weather');
    return res.data.data;
  },

  // Pest Risks
  async getPestRisks(): Promise<IPestRisk[]> {
    const res = await apiClient.get<{ success: boolean; data: IPestRisk[] }>('/pest-risk');
    return res.data.data;
  },

  // Market Prices
  async getMarketPrices(): Promise<IMarketPrice[]> {
    const res = await apiClient.get<{ success: boolean; data: IMarketPrice[] }>('/market-prices');
    return res.data.data;
  },

  // Farm Activities
  async getFarmActivities(): Promise<IFarmActivity[]> {
    const res = await apiClient.get<{ success: boolean; data: IFarmActivity[] }>('/farm-activities');
    return res.data.data;
  },

  async createFarmActivity(activity: Partial<IFarmActivity>): Promise<IFarmActivity> {
    const res = await apiClient.post<{ success: boolean; data: IFarmActivity }>('/farm-activities', activity);
    return res.data.data;
  },

  // Authentication
  async login(credentials: { email: string; password: string }) {
    const res = await apiClient.post<{ success: boolean; token: string; user: IUser }>('/auth/login', credentials);
    return res.data;
  },

  async register(data: { name: string; email: string; password: string; farmName?: string; role?: string }) {
    const res = await apiClient.post<{ success: boolean; token: string; user: IUser }>('/auth/register', data);
    return res.data;
  },

  async demoLogin() {
    const res = await apiClient.post<{ success: boolean; token: string; user: IUser }>('/auth/demo-login');
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<{ success: boolean; user: IUser }>('/auth/me');
    return res.data.user;
  },

  async checkHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // IoT Device Management & Sensor Pairing
  async getDevices(): Promise<IIoTDevice[]> {
    const res = await apiClient.get<{ success: boolean; data: IIoTDevice[] }>('/devices');
    return res.data.data;
  },

  async pairDevice(device: Partial<IIoTDevice>): Promise<{ device: IIoTDevice; updatedSoil: ISoilData }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { device: IIoTDevice; updatedSoil: ISoilData };
    }>('/devices/pair', device);
    return res.data.data;
  },

  async sendDeviceTelemetry(
    deviceId: string,
    readings: Partial<IIoTDevice['liveReadings']>
  ): Promise<{ device: IIoTDevice; updatedSoil: ISoilData }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { device: IIoTDevice; updatedSoil: ISoilData };
    }>(`/devices/${deviceId}/telemetry`, readings);
    return res.data.data;
  },

  async testDevicePing(deviceId: string): Promise<{ latencyMs: number; rssi: number; battery: number; timestamp: string }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { latencyMs: number; rssi: number; battery: number; timestamp: string };
    }>(`/devices/${deviceId}/ping`);
    return res.data.data;
  },

  async deleteDevice(deviceId: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/devices/${deviceId}`);
    return res.data.success;
  },
};
