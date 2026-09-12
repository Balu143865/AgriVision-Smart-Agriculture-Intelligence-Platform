import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Droplets,
  CloudSun,
  CloudRain,
  Cloud,
  CalendarDays,
  Bug,
  TrendingUp,
  IndianRupee,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Wind,
  Sun,
  Layers,
  RefreshCw,
  Plus,
  Compass,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sliders,
  Send,
  Loader2,
  FileDown,
  Download,
} from 'lucide-react';
import { DashboardSidebar, DashboardTab } from '../components/DashboardSidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { ExportPDFModal } from '../components/ExportPDFModal';
import { DeviceManagementSection } from '../components/DeviceManagementSection';
import { generateCropAndYieldPDF } from '../utils/pdfGenerator';
import { Sparkline } from '../components/Sparkline';
import { AnimatedCounter } from '../components/AnimatedCounter';
import {
  YieldPredictionChart,
  SoilMoistureChart,
  TemperatureTrendChart,
  RainfallChart,
  MarketPriceTrendChart,
} from '../components/InteractiveCharts';
import { api } from '../services/api';
import {
  IDashboardSummary,
  ICrop,
  ISoilData,
  IWeatherData,
  IPestRisk,
  IMarketPrice,
  IFarmActivity,
} from '../types';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states loaded from backend REST API
  const [dashboardData, setDashboardData] = useState<IDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Modals / forms
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isExportPDFModalOpen, setIsExportPDFModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('Irrigation');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  // Weather interactive day selection (0 = Today)
  const [selectedWeatherDayIndex, setSelectedWeatherDayIndex] = useState(0);

  const { selectedFarm } = useFarm();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleQuickDownloadPDF = (reportType: 'full' | 'crops' | 'yield' = 'full') => {
    setIsGeneratingPDF(true);
    showToast(
      `Compiling ${reportType === 'crops' ? 'Crop Health' : reportType === 'yield' ? 'Yield Analytics' : 'Comprehensive'} PDF Report...`
    );

    setTimeout(() => {
      try {
        generateCropAndYieldPDF({
          farmName: selectedFarm,
          agronomistName: user?.name || 'Dr. Ramesh Sundaram (Lead Agronomist)',
          crops: dashboardData?.topCrops || [],
          dashboardData,
          pestRisks: dashboardData?.pestRisks || [],
          reportType,
        });
        showToast('PDF Report generated and downloaded successfully!');
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        showToast('Error generating PDF report. Please try again.');
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 350);
  };

  const fetchBackendData = async () => {
    try {
      setRefreshing(true);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.warn('Backend call fallback to preview API or cache', err);
      try {
        const previewData = await api.getDashboardPreview();
        setDashboardData(previewData);
      } catch (fallbackErr) {
        console.error('Failed to load dashboard data:', fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [selectedFarm]);

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  const handleSoilDataUpdated = (newSoil: ISoilData) => {
    setDashboardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        soilOverview: newSoil,
        kpis: {
          ...prev.kpis,
          soilMoisture: {
            ...prev.kpis.soilMoisture,
            value: newSoil.soilMoisture,
          },
        },
      };
    });

    // Also update activities list in background
    api.getFarmActivities().then(activities => {
      setDashboardData(prev => (prev ? { ...prev, farmActivities: activities } : prev));
    }).catch(() => {});
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    try {
      const added = await api.createFarmActivity({
        title: newActivityTitle,
        category: newActivityCategory as any,
        description: newActivityDesc || 'Manual field operation logged by agronomist.',
        severity: 'Success',
        status: 'Completed',
        actor: 'Dr. Ramesh Sundaram',
      });

      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          farmActivities: [added, ...dashboardData.farmActivities],
        });
      }

      setIsAddActivityOpen(false);
      setNewActivityTitle('');
      setNewActivityDesc('');
      showToast('Farm activity logged and synchronized with database.');
    } catch (err) {
      showToast('Activity saved locally.');
    }
  };

  const handleTriggerIrrigation = async () => {
    try {
      showToast('Precision solar drip irrigation cycle initiated for Sector B.');
      if (dashboardData) {
        const updatedSoil = {
          ...dashboardData.soilOverview,
          soilMoisture: Math.min(85, dashboardData.soilOverview.soilMoisture + 4),
          irrigationRecommendation: 'Irrigation cycle currently active. Target root threshold 72%.',
          nextScheduledWatering: 'Cycle in progress (Duration: 45 mins)',
        };
        await api.updateSoilData(updatedSoil);
        setDashboardData({
          ...dashboardData,
          soilOverview: updatedSoil,
        });
      }
    } catch (e) {
      showToast('Drip cycle triggered.');
    }
  };

  // Fallback defaults if data is still fetching
  const kpis = dashboardData?.kpis || {
    cropHealth: { value: 92, unit: '%', trend: 4.2, status: 'Optimal Condition', subtext: '7 active crops' },
    soilMoisture: { value: 68, unit: '%', trend: 2.1, status: 'Optimal Root Level', subtext: 'Sensor S-12 30cm' },
    temperature: { value: 28, unit: '°C', trend: -1.2, status: 'Partly Cloudy', subtext: 'Humidity 64%' },
    yieldForecast: { value: 4.8, unit: 'Tons', trend: 8.5, status: '+0.4 vs baseline', subtext: 'AI Projection' },
    pestRisk: { value: 'Low', trend: 'Stable', status: 'Guarded', subtext: 'Thermal CV Scan' },
    marketPrice: { value: 2450, unit: '₹ / Quintal', trend: 2.9, status: 'Bullish', subtext: 'Rice at Karnal Mandi' },
  };

  const crops = dashboardData?.topCrops || [];
  const soil = dashboardData?.soilOverview || ({} as ISoilData);
  const weather = dashboardData?.weatherOverview || ({} as IWeatherData);
  const pestRisks = dashboardData?.pestRisks || [];
  const marketPrices = dashboardData?.marketPrices || [];
  const farmActivities = dashboardData?.farmActivities || [];

  // Dynamically compute 7-day forecast starting from TODAY's real date, regardless of when user opens app
  const dynamicForecast = useMemo(() => {
    const today = new Date();
    const rawList = weather.forecast7Days || [];
    const defaultTemplates = [
      { condition: 'Partly Cloudy', tempMax: 31, tempMin: 22, rainChance: 25, humidity: 62 },
      { condition: 'Light Rain', tempMax: 30, tempMin: 23, rainChance: 70, humidity: 78 },
      { condition: 'Cloudy', tempMax: 29, tempMin: 22, rainChance: 45, humidity: 72 },
      { condition: 'Sunny', tempMax: 32, tempMin: 24, rainChance: 10, humidity: 55 },
      { condition: 'Clear Sky', tempMax: 33, tempMin: 24, rainChance: 5, humidity: 50 },
      { condition: 'Partly Cloudy', tempMax: 31, tempMin: 23, rainChance: 20, humidity: 58 },
      { condition: 'Light Rain', tempMax: 30, tempMin: 22, rainChance: 65, humidity: 74 },
    ];

    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullWeekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateFormatted = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const raw = rawList[idx];
      const template = raw || defaultTemplates[idx % defaultTemplates.length];

      return {
        day: dayShort,
        fullWeekday,
        date: dateFormatted,
        fullDateFormatted,
        tempMax: template.tempMax ?? 31,
        tempMin: template.tempMin ?? 22,
        condition: template.condition || 'Partly Cloudy',
        rainChance: template.rainChance ?? 25,
        humidity: template.humidity ?? 62,
        isToday: idx === 0,
        index: idx,
      };
    });
  }, [weather.forecast7Days]);

  const activeForecastDay = dynamicForecast[selectedWeatherDayIndex] || dynamicForecast[0];

  const getWeatherIcon = (condition: string, className = 'w-6 h-6') => {
    const c = (condition || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) {
      return <CloudRain className={`${className} text-cyan-400`} />;
    }
    if (c.includes('clear') || c.includes('sunny')) {
      return <Sun className={`${className} text-amber-400`} />;
    }
    if (c.includes('partly')) {
      return <CloudSun className={`${className} text-emerald-400`} />;
    }
    return <Cloud className={`${className} text-slate-400`} />;
  };

  // Hourly progression for the selected forecast day
  const selectedDayHourlyTrends = useMemo(() => {
    const hours = [
      { time: '06:00', tempOffset: -5, humidityOffset: 15, rainProbOffset: -5 },
      { time: '09:00', tempOffset: -2, humidityOffset: 5, rainProbOffset: 0 },
      { time: '12:00', tempOffset: 0, humidityOffset: -8, rainProbOffset: 5 },
      { time: '15:00', tempOffset: 2, humidityOffset: -14, rainProbOffset: 8 },
      { time: '18:00', tempOffset: -1, humidityOffset: 2, rainProbOffset: 12 },
      { time: '21:00', tempOffset: -4, humidityOffset: 12, rainProbOffset: -2 },
    ];

    const targetMax = activeForecastDay?.tempMax ?? 31;
    const baseRain = activeForecastDay?.rainChance ?? 20;
    const baseHumidity = activeForecastDay?.humidity ?? 60;

    return hours.map(h => ({
      time: h.time,
      temp: Math.round(targetMax + h.tempOffset),
      humidity: Math.min(96, Math.max(35, Math.round(baseHumidity + h.humidityOffset))),
      rainProb: Math.min(100, Math.max(0, Math.round(baseRain + h.rainProbOffset))),
    }));
  }, [activeForecastDay]);

  // Filter crops if search query typed
  const filteredCrops = crops.filter(c =>
    c.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.variety.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading && !dashboardData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 space-y-4 transition-colors ${
        isDark ? 'bg-[#08100c] text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <div className="text-center">
          <p className={`text-sm font-semibold tracking-wide font-['Outfit'] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            Connecting to AgriVision Intelligence Core...
          </p>
          <p className={`text-xs font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Fetching telemetry from MongoDB & LoRaWAN Node
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors duration-300 ${
      isDark ? 'bg-[#08100c] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Action Toast */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-900/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-xs font-medium text-emerald-100"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Component */}
      <DashboardSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <DashboardHeader
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchQuery={setSearchFilter}
          onSelectTab={setCurrentTab}
        />

        {/* Dashboard Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Sub-Header / Breadcrumb & Refresh action */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${
            isDark ? 'border-emerald-950/70' : 'border-slate-200'
          }`}>
            <div>
              <div className={`flex items-center gap-2 text-xs font-mono mb-1 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                <span>AgriVision Core</span>
                <span>/</span>
                <span className="capitalize text-emerald-500 font-semibold">{currentTab}</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold font-['Outfit'] tracking-tight flex items-center gap-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {currentTab === 'overview' && 'Intelligence Overview'}
                {currentTab === 'crops' && 'Crop Health & Phenology'}
                {currentTab === 'soil' && 'Soil & Precision Irrigation'}
                {currentTab === 'weather' && 'Weather & Micro-Climate'}
                {currentTab === 'pest' && 'Pest & Pathogen Surveillance'}
                {currentTab === 'yield' && 'Yield Analytics & Harvesting'}
                {currentTab === 'market' && 'Agricultural Mandi Prices'}
                {currentTab === 'activity' && 'Farm Telemetry & Operations'}
                {currentTab === 'settings' && 'IoT Device Management & Settings'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="export-pdf-report-btn"
                onClick={() => setIsExportPDFModalOpen(true)}
                disabled={isGeneratingPDF}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-70 border ${
                  isDark
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-700/50 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
                title="Generate & Download Crop Health and Yield PDF Report"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>Export PDF Report</span>
              </button>

              <button
                onClick={fetchBackendData}
                disabled={refreshing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                  isDark
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-800/40 text-zinc-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                }`}
                title="Refresh backend telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Node</span>
              </button>

              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Activity</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* SECTION 5: KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {/* KPI 1: Crop Health */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-emerald-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-emerald-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Crop Health</span>
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                      <Sprout className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.cropHealth.value}
                      className={`text-2xl font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}
                    />
                    <span className="text-sm font-bold text-emerald-400">%</span>
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.cropHealth.trend}%
                    </span>
                    <Sparkline data={[86, 88, 89, 90, 91, 92]} color="#10b981" width={56} height={20} />
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{kpis.cropHealth.status}</span>
                </div>

                {/* KPI 2: Soil Moisture */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-cyan-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-cyan-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Soil Moisture</span>
                    <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.soilMoisture.value}
                      className={`text-2xl font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}
                    />
                    <span className="text-sm font-bold text-cyan-400">%</span>
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.soilMoisture.trend}%
                    </span>
                    <Sparkline data={[61, 64, 62, 65, 67, 68]} color="#06b6d4" width={56} height={20} />
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{kpis.soilMoisture.status}</span>
                </div>

                {/* KPI 3: Temperature */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-amber-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-amber-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Temperature</span>
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                      <CloudSun className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.temperature.value}
                      className={`text-2xl font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}
                    />
                    <span className="text-sm font-bold text-amber-400">°C</span>
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <ArrowDownRight className="w-3 h-3" />{kpis.temperature.trend}°C
                    </span>
                    <Sparkline data={[29, 31, 30, 29, 28, 28]} color="#f59e0b" width={56} height={20} />
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{kpis.temperature.status}</span>
                </div>

                {/* KPI 4: Yield Forecast */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-lime-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-lime-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Yield Forecast</span>
                    <div className="p-1.5 rounded-md bg-lime-500/10 text-lime-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.yieldForecast.value}
                      decimals={1}
                      className={`text-2xl font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}
                    />
                    <span className="text-sm font-bold text-lime-400">Tons</span>
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] text-lime-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.yieldForecast.trend}%
                    </span>
                    <Sparkline data={[4.1, 4.3, 4.4, 4.5, 4.7, 4.8]} color="#84cc16" width={56} height={20} />
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{kpis.yieldForecast.status}</span>
                </div>

                {/* KPI 5: Pest Risk */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-rose-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-rose-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Pest Risk</span>
                    <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                      <Bug className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-['Outfit'] text-emerald-400">
                      {kpis.pestRisk.value}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      {kpis.pestRisk.trend}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                      isDark
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      Safe
                    </span>
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{kpis.pestRisk.subtext}</span>
                </div>

                {/* KPI 6: Market Price */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-md group active:scale-[0.98] ${
                    isDark
                      ? 'bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border-emerald-800/40 hover:border-yellow-500/50 text-white'
                      : 'bg-white border-emerald-200/90 hover:border-yellow-400 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Market Price</span>
                    <div className="p-1.5 rounded-md bg-yellow-500/10 text-yellow-400">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-yellow-400">₹</span>
                    <AnimatedCounter
                      value={kpis.marketPrice.value}
                      className={`text-2xl font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}
                    />
                  </div>
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                    <span className="text-[11px] text-yellow-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.marketPrice.trend}%
                    </span>
                    <Sparkline data={[2280, 2320, 2350, 2380, 2410, 2450]} color="#eab308" width={56} height={20} />
                  </div>
                  <span className={`text-[10px] block mt-1 truncate ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Per Quintal</span>
                </div>
              </div>

              {/* SECTION 6: AGRICULTURE ANALYTICS (Charts) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Chart 1: Crop Yield Prediction */}
                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                      : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div>
                      <h3 className={`text-sm font-bold font-['Outfit'] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Crop Yield Prediction (Actual vs AI Forecast)
                      </h3>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Tons per acre trajectory modeled with NDVI spectral data</p>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded self-start sm:self-auto border ${
                      isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      +8.5% YoY
                    </span>
                  </div>
                  <YieldPredictionChart data={dashboardData?.charts.yieldPrediction || []} />
                </div>

                {/* Chart 2: Soil Moisture Trend */}
                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                      : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div>
                      <h3 className={`text-sm font-bold font-['Outfit'] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        Soil Moisture Trend & Optimal Threshold
                      </h3>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Continuous 24-hour reading across 30cm root depths</p>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded self-start sm:self-auto border ${
                      isDark
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40'
                        : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    }`}>
                      Current: {soil.soilMoisture || 68}%
                    </span>
                  </div>
                  <SoilMoistureChart data={dashboardData?.charts.soilMoistureTrend || []} />
                </div>

                {/* Chart 3: Temperature Trend */}
                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                      : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div>
                      <h3 className={`text-sm font-bold font-['Outfit'] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Sun className="w-4 h-4 text-amber-400" />
                        Temperature & Heat Index Curve
                      </h3>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Ambient air temperature vs plant canopy thermal stress</p>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded self-start sm:self-auto border ${
                      isDark
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      28°C Ambient
                    </span>
                  </div>
                  <TemperatureTrendChart data={dashboardData?.charts.temperatureTrend || []} />
                </div>

                {/* Chart 4: Rainfall */}
                <div
                  className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                      : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div>
                      <h3 className={`text-sm font-bold font-['Outfit'] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <CloudSun className="w-4 h-4 text-blue-400" />
                        Rainfall Distribution (2026 vs 5-Yr Mean)
                      </h3>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Precipitation volumes in mm for monsoon water budget</p>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded self-start sm:self-auto border ${
                      isDark
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      Seasonal: +6.2%
                    </span>
                  </div>
                  <RainfallChart data={dashboardData?.charts.rainfallTrend || []} />
                </div>
              </div>

              {/* Chart 5: Market Price Trend (Full Width) */}
              <div
                className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold font-['Outfit'] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <IndianRupee className="w-4 h-4 text-yellow-400" />
                      Agricultural Commodity Mandi Price Trend (INR / Quintal)
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Monthly spot trade averages across Rice, Wheat, Cotton, and Maize</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('market')}
                    className="text-xs font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View all commodities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <MarketPriceTrendChart data={dashboardData?.charts.marketPriceTrend || []} />
              </div>
            </div>
          )}

          {/* TAB 2: CROP HEALTH */}
          {currentTab === 'crops' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Real-time physiological health, phenological growth stage, and disease vulnerability across all active blocks.
                </p>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                    isDark
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  }`}>
                    Total Monitored: {filteredCrops.length} Crops
                  </span>
                  <button
                    onClick={() => handleQuickDownloadPDF('crops')}
                    disabled={isGeneratingPDF}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors shadow-xs active:scale-95 disabled:opacity-60 border ${
                      isDark
                        ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-700/50 text-emerald-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    }`}
                    title="Download Crop Health Audit PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download Crop Audit PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map(crop => (
                  <div
                    key={crop._id}
                    className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                      isDark
                        ? 'bg-gradient-to-b from-[#0f2117] to-[#09150e] border-emerald-800/40 hover:border-emerald-500/50 text-white shadow-xl'
                        : 'bg-white border-emerald-200 hover:border-emerald-400 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>{crop.cropName}</h3>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              crop.status === 'Optimal'
                                ? isDark
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : crop.status === 'Attention'
                                ? isDark
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                                : isDark
                                ? 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {crop.status}
                          </span>
                        </div>
                        <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{crop.variety}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {crop.healthScore}%
                        </span>
                        <span className={`block text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Health Index</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className={`flex justify-between text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        <span>Canopy Vigor</span>
                        <span className="font-mono text-emerald-500 font-semibold">{crop.healthScore}/100</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950/80' : 'bg-slate-100'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            crop.healthScore > 85 ? 'bg-emerald-500' : crop.healthScore > 75 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${crop.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Spec Grid */}
                    <div className={`grid grid-cols-2 gap-2 text-xs pt-2 border-t ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-slate-50 border border-slate-100'}`}>
                        <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Growth Stage</span>
                        <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{crop.growthStage}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-slate-50 border border-slate-100'}`}>
                        <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Moisture</span>
                        <span className={`font-medium font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{crop.moisture}%</span>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-slate-50 border border-slate-100'}`}>
                        <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Disease Risk</span>
                        <span
                          className={`font-semibold font-mono ${
                            crop.diseaseRisk === 'Low'
                              ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                              : crop.diseaseRisk === 'Medium'
                              ? isDark ? 'text-amber-400' : 'text-amber-700'
                              : isDark ? 'text-rose-400' : 'text-rose-700'
                          }`}
                        >
                          {crop.diseaseRisk}
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-slate-50 border border-slate-100'}`}>
                        <span className={`text-[10px] block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Expected Yield</span>
                        <span className={`font-medium font-mono ${isDark ? 'text-lime-300' : 'text-emerald-700'}`}>{crop.expectedYield} t/acre</span>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] pt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      <span>Area: {crop.acreage} Acres</span>
                      <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>Harvest: {crop.harvestWindow}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SOIL & IRRIGATION */}
          {currentTab === 'soil' && (
            <div className="space-y-6">
              {/* Irrigation Advisory Banner */}
              <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-950/90 via-[#0d261a] to-cyan-950/80 border-emerald-600/40 text-white shadow-2xl'
                  : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200 text-slate-900 shadow-xs'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                      isDark ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      Automated Evapotranspiration Recommendation
                    </span>
                    <h3 className={`text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {soil.irrigationRecommendation || 'Irrigation recommended in approximately 6 hours.'}
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                      Next cycle: <span className={`font-mono font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{soil.nextScheduledWatering || 'Today at 04:30 PM IST'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTriggerIrrigation}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-md shrink-0 flex items-center gap-2 active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Drip Cycle Now</span>
                </button>
              </div>

              {/* Soil Telemetry Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Moisture */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Soil Moisture</span>
                  <div className="text-2xl font-bold font-mono text-cyan-500">
                    {soil.soilMoisture || 68}%
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-cyan-500 h-full" style={{ width: `${soil.soilMoisture || 68}%` }} />
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Depth: 30cm Root Zone</span>
                </div>

                {/* pH Level */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>pH Level</span>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                    {soil.phLevel || 6.8}
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-amber-500 h-full" style={{ width: `${((soil.phLevel || 6.8) / 14) * 100}%` }} />
                  </div>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Optimal (6.5 - 7.2)</span>
                </div>

                {/* Nitrogen */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Nitrogen (N)</span>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {soil.nitrogen || 245} <span className={`text-xs font-sans ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>kg/ha</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-emerald-500 h-full" style={{ width: '75%' }} />
                  </div>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Adequate Reserves</span>
                </div>

                {/* Phosphorus */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Phosphorus (P)</span>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-lime-400' : 'text-lime-600'}`}>
                    {soil.phosphorus || 38} <span className={`text-xs font-sans ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>kg/ha</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-lime-500 h-full" style={{ width: '65%' }} />
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Target Range: 30-50</span>
                </div>

                {/* Potassium */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Potassium (K)</span>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {soil.potassium || 310} <span className={`text-xs font-sans ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>kg/ha</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-yellow-500 h-full" style={{ width: '82%' }} />
                  </div>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>High Vigor</span>
                </div>

                {/* Soil Temperature */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Soil Temperature</span>
                  <div className={`text-2xl font-bold font-mono ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {soil.soilTemperature || 24.2}°C
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-slate-100'}`}>
                    <div className="bg-orange-500 h-full" style={{ width: '60%' }} />
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>EC: {soil.electricalConductivity || 1.15} dS/m</span>
                </div>
              </div>

              {/* Soil Chart */}
              <div
                className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <h3 className={`text-sm font-bold font-['Outfit'] mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hourly Soil Moisture Saturation vs Evapotranspiration
                </h3>
                <SoilMoistureChart data={dashboardData?.charts.soilMoistureTrend || []} />
              </div>
            </div>
          )}

          {/* TAB 4: WEATHER INTELLIGENCE */}
          {currentTab === 'weather' && (
            <div className="space-y-6">
              {/* Header Status Bar with Date & Active Selection Notice */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-['Outfit']">
                        {activeForecastDay.isToday ? 'Today' : activeForecastDay.fullWeekday} • {activeForecastDay.fullDateFormatted}
                      </span>
                      {activeForecastDay.isToday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Live Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Forecast Inspection
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {activeForecastDay.isToday
                        ? 'Edge micro-station live telemetry stream synchronized with farm zone sensors'
                        : `Simulated weather telemetry & agronomic schedule for ${activeForecastDay.fullWeekday}`}
                    </p>
                  </div>
                </div>

                {!activeForecastDay.isToday && (
                  <button
                    onClick={() => setSelectedWeatherDayIndex(0)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-end sm:self-auto cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Today ({dynamicForecast[0]?.day})
                  </button>
                )}
              </div>

              {/* Current/Selected Weather Card */}
              <div
                className={`p-6 rounded-2xl border shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-[#0d1f15] via-[#09150e] to-[#0d2217] border-emerald-700/40'
                    : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-100/90 border-emerald-200'
                }`}
              >
                <div className="space-y-2 md:border-r border-emerald-950/80 pr-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-500 uppercase tracking-wider font-semibold">
                      {activeForecastDay.isToday ? 'Micro-Station Telemetry' : `${activeForecastDay.fullWeekday} Forecast`}
                    </span>
                    {getWeatherIcon(activeForecastDay.condition, 'w-5 h-5')}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-extrabold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeForecastDay.isToday ? (weather.temperature || activeForecastDay.tempMax) : activeForecastDay.tempMax}°
                    </span>
                    <span className="text-sm font-bold text-zinc-400">C</span>
                    <div className="text-xs font-mono ml-auto text-right">
                      <div className="text-emerald-500 font-bold">H: {activeForecastDay.tempMax}°</div>
                      <div className="text-zinc-400 font-medium">L: {activeForecastDay.tempMin}°</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                    {activeForecastDay.condition}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">
                    Barometric Pressure: {weather.pressure || 1012} hPa
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-3">
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-white/80 border-emerald-200'
                    }`}
                  >
                    <span className="text-xs text-zinc-400 block">Relative Humidity</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">{activeForecastDay.humidity}%</span>
                    <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Dew point {Math.round(activeForecastDay.tempMin - 2)}°C
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-white/80 border-emerald-200'
                    }`}
                  >
                    <span className="text-xs text-zinc-400 block">Precipitation Chance</span>
                    <span className="text-lg font-bold font-mono text-blue-400">{activeForecastDay.rainChance}%</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      {activeForecastDay.rainChance >= 50 ? 'Rain Probability High' : 'Low Precipitation Risk'}
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-white/80 border-emerald-200'
                    }`}
                  >
                    <span className="text-xs text-zinc-400 block">Wind Velocity</span>
                    <span className={`text-lg font-bold font-mono ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {activeForecastDay.isToday ? (weather.windSpeed || 12.8) : (11 + (activeForecastDay.tempMax % 4)).toFixed(1)} km/h
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Heading SSW (210°)
                    </span>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-white/80 border-emerald-200'
                    }`}
                  >
                    <span className="text-xs text-zinc-400 block">Solar UV Index</span>
                    <span className="text-lg font-bold font-mono text-amber-400">
                      {activeForecastDay.condition === 'Sunny' || activeForecastDay.condition === 'Clear Sky'
                        ? '7.8'
                        : activeForecastDay.condition.includes('Rain')
                        ? '3.5'
                        : '6.4'}
                    </span>
                    <span className="text-[10px] text-amber-500 block mt-0.5">
                      {activeForecastDay.condition.includes('Rain') ? 'Low UV' : 'Moderate/High Radiation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agronomic Advisory Card for Active Day */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  activeForecastDay.rainChance >= 60
                    ? isDark
                      ? 'bg-blue-950/30 border-blue-800/40 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                    : activeForecastDay.tempMax >= 32
                    ? isDark
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                    : isDark
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-['Outfit'] uppercase tracking-wider">
                      Agronomic Advisory ({activeForecastDay.fullWeekday})
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {activeForecastDay.rainChance >= 60
                      ? `High rainfall probability (${activeForecastDay.rainChance}%). Postpone foliar pesticide sprays and synthetic nitrogen top-dressing. Keep root drainage valves cleared.`
                      : activeForecastDay.tempMax >= 32
                      ? `Elevated daytime temperature (${activeForecastDay.tempMax}°C) increases crop evapotranspiration. Schedule micro-irrigation pulse in early morning to prevent canopy wilting.`
                      : `Favorable agricultural weather with moderate humidity (${activeForecastDay.humidity}%). Ideal window for weeding, organic fertilizer dosing, and multispectral drone canopy health audits.`}
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-black/20 shrink-0">
                  {activeForecastDay.rainChance >= 60 ? 'Drainage Focus' : activeForecastDay.tempMax >= 32 ? 'Thermal Mitigation' : 'Optimal Field Work'}
                </div>
              </div>

              {/* 7-Day Forecast Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      7-Day Micro-Climate Agricultural Forecast
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Starts dynamically from today. Click any day card to view its detailed weather telemetry.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 hidden sm:inline-block">
                    Click day to inspect
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {dynamicForecast.map((day, idx) => {
                    const isSelected = selectedWeatherDayIndex === idx;
                    return (
                      <button
                        key={`${day.day}-${day.date}`}
                        type="button"
                        onClick={() => setSelectedWeatherDayIndex(idx)}
                        className={`p-3.5 rounded-xl border text-center space-y-2 transition-all cursor-pointer relative text-left sm:text-center ${
                          isSelected
                            ? isDark
                              ? 'bg-emerald-900/50 border-emerald-400 shadow-lg shadow-emerald-950/70 ring-2 ring-emerald-500/50 scale-[1.02]'
                              : 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400 scale-[1.02]'
                            : day.isToday
                            ? isDark
                              ? 'bg-emerald-950/40 border-emerald-600/60 hover:border-emerald-500'
                              : 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400'
                            : isDark
                            ? 'bg-[#0c1711] border-emerald-900/40 hover:border-emerald-700/60 hover:bg-emerald-950/20'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        {/* Today or Selected Pill */}
                        <div className="flex items-center justify-between sm:justify-center">
                          <span
                            className={`text-xs font-bold font-['Outfit'] block ${
                              isSelected
                                ? 'text-emerald-400 font-extrabold'
                                : isDark
                                ? 'text-white'
                                : 'text-slate-900'
                            }`}
                          >
                            {day.day}
                          </span>
                          {day.isToday && (
                            <span className="sm:absolute sm:top-1.5 sm:right-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono uppercase bg-emerald-500 text-black">
                              TODAY
                            </span>
                          )}
                        </div>

                        <span className={`text-[11px] block font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {day.date}
                        </span>

                        <div className="py-1">
                          <div className="mx-auto w-fit">
                            {getWeatherIcon(day.condition, 'w-6 h-6 mx-auto')}
                          </div>
                          <span className={`text-[11px] block mt-1 truncate font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {day.condition}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs font-mono pt-1">
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{day.tempMax}°</span>
                          <span className="text-zinc-400 font-medium">{day.tempMin}°</span>
                        </div>

                        <div
                          className={`text-[10px] font-mono pt-1.5 border-t ${
                            isDark ? 'border-emerald-950/80 text-cyan-400' : 'border-slate-100 text-cyan-700 font-medium'
                          }`}
                        >
                          Rain: {day.rainChance}%
                        </div>

                        {isSelected && (
                          <div className="text-[9px] font-mono font-bold text-emerald-400 tracking-tight">
                            ● Active View
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hourly Micro-Climate Progression for Selected Day */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border shadow-xl space-y-4 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Diurnal Hourly Micro-Climate Timeline — {activeForecastDay.fullWeekday} ({activeForecastDay.date})
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Estimated canopy ambient temperature, humidity curve, and precipitation probabilities through the day
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40 self-start sm:self-auto">
                    {activeForecastDay.isToday ? 'Live Station Sync' : 'Predictive Model'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                  {selectedDayHourlyTrends.map(hour => (
                    <div
                      key={hour.time}
                      className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                        isDark ? 'bg-[#08120c] border-emerald-950 hover:border-emerald-800/60' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-xs font-mono font-semibold text-zinc-400">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <span>{hour.time}</span>
                      </div>
                      <div className={`text-base font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {hour.temp}°C
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        {hour.humidity}% Hum
                      </div>
                      <div className="text-[10px] text-blue-400 font-mono">
                        Rain: {hour.rainProb}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PEST & DISEASE */}
          {currentTab === 'pest' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Multispectral drone camera scans and field trap telemetry detecting pathogenetic risks early.
                </p>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md border self-start sm:self-auto ${
                  isDark
                    ? 'text-rose-400 bg-rose-950/50 border-rose-800/40'
                    : 'text-rose-800 bg-rose-50 border-rose-200'
                }`}>
                  1 Urgent Action Recommended
                </span>
              </div>

              <div className="space-y-4">
                {pestRisks.map(risk => (
                  <div
                    key={risk._id}
                    className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm ${
                      risk.riskLevel === 'High'
                        ? isDark
                          ? 'bg-gradient-to-r from-rose-950/40 via-[#140b0e] to-[#0e1611] border-rose-600/50 shadow-rose-950/20'
                          : 'bg-gradient-to-r from-rose-50 via-orange-50/50 to-amber-50/30 border-rose-300'
                        : risk.riskLevel === 'Medium'
                        ? isDark
                          ? 'bg-gradient-to-r from-amber-950/30 via-[#14120a] to-[#0e1611] border-amber-600/50'
                          : 'bg-gradient-to-r from-amber-50 via-yellow-50/40 to-slate-50 border-amber-300'
                        : isDark
                        ? 'bg-[#0c1711] border-emerald-800/40'
                        : 'bg-white border-emerald-200'
                    }`}
                  >
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b ${
                      isDark ? 'border-emerald-950/80' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            risk.riskLevel === 'High'
                              ? isDark
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-rose-100 text-rose-700 border-rose-200'
                              : risk.riskLevel === 'Medium'
                              ? isDark
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                              : isDark
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <Bug className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>{risk.cropName}</h3>
                            <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>({risk.pestCategory})</span>
                          </div>
                          <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{risk.pestName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                            risk.riskLevel === 'High'
                              ? isDark
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                              : risk.riskLevel === 'Medium'
                              ? isDark
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                              : isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          Risk Level: {risk.riskLevel}
                        </span>
                        <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          Affected: {risk.affectedAreaPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                      <div>
                        <span className={`font-semibold block mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Detected Symptoms</span>
                        <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{risk.symptoms}</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${
                        isDark ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'
                      }`}>
                        <span className={`font-bold block mb-1 flex items-center gap-1.5 ${
                          isDark ? 'text-emerald-400' : 'text-emerald-800'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recommended Action Protocol
                        </span>
                        <p className={`leading-relaxed ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{risk.recommendedAction}</p>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] pt-3 border-t mt-3 font-mono ${
                      isDark ? 'border-emerald-950/60 text-zinc-500' : 'border-slate-200 text-slate-500'
                    }`}>
                      <span>Detected: {risk.detectedAt}</span>
                      <span>AI Model Confidence: {risk.confidenceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: YIELD ANALYTICS */}
          {currentTab === 'yield' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Historical harvest yields, multi-month machine learning forecasts, and regional harvest calendars.
                </p>
                <button
                  onClick={() => handleQuickDownloadPDF('yield')}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-60 self-start sm:self-auto"
                >
                  <FileDown className="w-3.5 h-3.5 text-white" />
                  <span>Download Yield Report PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-5 rounded-2xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Estimated Total Harvest</span>
                  <div className={`text-3xl font-extrabold font-['Outfit'] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    428.5 <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Tons</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>+14% higher than 3-year baseline across 185 total farm acres.</p>
                </div>
                <div className={`p-5 rounded-2xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Top Performing Plot</span>
                  <div className={`text-3xl font-extrabold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Maize (Plot 3)
                  </div>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Yielding 6.1 Tons/acre with Pioneer P3396 hybrid vigor.</p>
                </div>
                <div className={`p-5 rounded-2xl border space-y-2 transition-all ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Optimal Harvest Window</span>
                  <div className={`text-3xl font-extrabold font-['Outfit'] ${isDark ? 'text-lime-300' : 'text-emerald-700'}`}>
                    Oct 24 - Nov 12
                  </div>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Dry weather window predicted by radar telemetry.</p>
                </div>
              </div>

              <div
                className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-4 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <h3 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Historical vs Projected Crop Yield Expansion
                </h3>
                <YieldPredictionChart data={dashboardData?.charts.yieldPrediction || []} />
              </div>
            </div>
          )}

          {/* TAB 7: MARKET INTELLIGENCE */}
          {currentTab === 'market' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Daily APMC Mandi arrival rates, price variations in Indian Rupees (INR), and short-term volatility forecasts.
                </p>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md border self-start sm:self-auto ${
                  isDark
                    ? 'text-yellow-400 bg-yellow-950/50 border-yellow-800/40'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}>
                  Spot Currency: INR (₹)
                </span>
              </div>

              {/* Price Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketPrices.map(item => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      isDark
                        ? 'bg-gradient-to-b from-[#0f2117] to-[#09150e] border-emerald-800/40 shadow-lg text-white'
                        : 'bg-white border-emerald-200 shadow-xs text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.product}</h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          item.marketTrend === 'Bullish'
                            ? isDark
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.marketTrend === 'Bearish'
                            ? isDark
                              ? 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.marketTrend}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>₹</span>
                        <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.currentPrice.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>/ {item.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono mt-1">
                        <span className={item.percentageChange >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}>
                          {item.percentageChange >= 0 ? '+' : ''}{item.percentageChange}%
                        </span>
                        <span className={isDark ? 'text-zinc-500' : 'text-slate-500'}>vs yesterday (₹{item.previousPrice})</span>
                      </div>
                    </div>

                    <div className={`pt-2 border-t text-[11px] ${isDark ? 'border-emerald-950 text-zinc-400' : 'border-slate-100 text-slate-500'}`}>
                      <span>Mandi: </span>
                      <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{item.primaryMandi}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Trend Chart */}
              <div
                className={`p-3.5 sm:p-5 rounded-2xl border shadow-xl space-y-3 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-xs'
                }`}
              >
                <h3 className={`text-sm font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  6-Month Mandi Price Trajectory (INR / Quintal)
                </h3>
                <MarketPriceTrendChart data={dashboardData?.charts.marketPriceTrend || []} />
              </div>
            </div>
          )}

          {/* TAB 8: FARM ACTIVITY */}
          {currentTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Comprehensive audit trail of precision drip irrigation, drone scoutings, sensor calibrations, and fertilization cycles.
                </p>
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Operation</span>
                </button>
              </div>

              <div className={`rounded-2xl border overflow-hidden shadow-xl ${
                isDark
                  ? 'divide-y divide-emerald-950/80 bg-[#0c1711] border-emerald-800/40'
                  : 'divide-y divide-slate-100 bg-white border-emerald-200 shadow-xs'
              }`}>
                {farmActivities.map(act => (
                  <div key={act._id} className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? 'hover:bg-emerald-950/20' : 'hover:bg-slate-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          act.severity === 'Success'
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : act.severity === 'Warning'
                            ? isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
                            : act.severity === 'High'
                            ? isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-700'
                            : isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                            isDark
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {act.category}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{act.description}</p>
                      </div>
                    </div>

                    <div className={`flex sm:flex-col items-center sm:items-end justify-between text-xs shrink-0 font-mono ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      <span>{act.timestamp}</span>
                      <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{act.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="space-y-6 max-w-5xl">
              {/* DEVICE MANAGEMENT SECTION */}
              <DeviceManagementSection
                onSoilDataUpdated={handleSoilDataUpdated}
                onToast={showToast}
                selectedFarm={selectedFarm}
              />

              {/* PLATFORM CONFIGURATION */}
              <div
                className={`p-6 rounded-2xl border shadow-xl space-y-6 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0c1711] border-emerald-800/40 text-white'
                    : 'bg-white border-emerald-200 text-slate-900'
                }`}
              >
                <h3
                  className={`text-base font-bold font-['Outfit'] pb-3 border-b ${
                    isDark ? 'text-white border-emerald-950' : 'text-slate-900 border-slate-100'
                  }`}
                >
                  AgriVision Platform & Telemetry Configuration
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Active Farm Unit Gateway
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedFarm}
                      className={`w-full p-2.5 rounded-lg border font-mono ${
                        isDark
                          ? 'bg-emerald-950/40 border-emerald-900 text-zinc-200'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      LoRaWAN Mesh Telemetry Transmission Cadence
                    </label>
                    <select
                      className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                        isDark
                          ? 'bg-[#08100c] border-emerald-800 text-zinc-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option>Continuous (Every 5 minutes - Solar LoRaWAN Multi-Node)</option>
                      <option>Balanced (Every 15 minutes)</option>
                      <option>Battery Saver (Every 1 hour)</option>
                    </select>
                  </div>

                  <div
                    className={`pt-4 border-t space-y-3 ${
                      isDark ? 'border-emerald-950' : 'border-slate-100'
                    }`}
                  >
                    <span className={`font-semibold block ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      Database Architecture & Persistence Engine
                    </span>
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${
                        isDark
                          ? 'bg-emerald-950/30 border-emerald-800/40'
                          : 'bg-emerald-50/60 border-emerald-100'
                      }`}
                    >
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Active Storage Engine
                        </p>
                        <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {dashboardData?.databaseSource || 'MongoDB Mongoose Document Store / Resilient Memory Model'}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 text-emerald-500 font-mono text-[11px] font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Connected & Synchronized
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => showToast('Configuration saved successfully.')}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: LOG FARM ACTIVITY */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 text-xs transition-all ${
            isDark
              ? 'bg-[#0b1611] border-emerald-700/60 text-zinc-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>Log Farm Operation</h3>
              <button
                onClick={() => setIsAddActivityOpen(false)}
                className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Operation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector B Micronutrient Spray"
                  value={newActivityTitle}
                  onChange={e => setNewActivityTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark
                      ? 'bg-[#08100c] border-emerald-800 text-zinc-100 placeholder-zinc-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Category</label>
                <select
                  value={newActivityCategory}
                  onChange={e => setNewActivityCategory(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark
                      ? 'bg-[#08100c] border-emerald-800 text-zinc-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option>Irrigation</option>
                  <option>Fertilization</option>
                  <option>Pest Control</option>
                  <option>Harvesting</option>
                  <option>Sensor Calibration</option>
                  <option>Soil Testing</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Details of inputs applied, plot quadrant, or sensor telemetry readings..."
                  value={newActivityDesc}
                  onChange={e => setNewActivityDesc(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDark
                      ? 'bg-[#08100c] border-emerald-800 text-zinc-100 placeholder-zinc-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPORT INTELLIGENCE PDF MODAL */}
      <ExportPDFModal
        isOpen={isExportPDFModalOpen}
        onClose={() => setIsExportPDFModalOpen(false)}
        farmName={selectedFarm}
        agronomistName={user?.name || 'Dr. Ramesh Sundaram (Lead Agronomist)'}
        crops={dashboardData?.topCrops || []}
        dashboardData={dashboardData}
        pestRisks={dashboardData?.pestRisks || []}
        onSuccessToast={showToast}
      />
    </div>
  );
};
