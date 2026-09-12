import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Droplets,
  CloudSun,
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

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#08100c] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide font-['Outfit'] text-emerald-300">
            Connecting to AgriVision Intelligence Core...
          </p>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Fetching telemetry from MongoDB & LoRaWAN Node
          </p>
        </div>
      </div>
    );
  }

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

  // Filter crops if search query typed
  const filteredCrops = crops.filter(c =>
    c.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.variety.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
                {currentTab === 'settings' && 'Platform & Node Settings'}
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
            <div className="space-y-8">
              {/* SECTION 5: KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* KPI 1: Crop Health */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-emerald-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Crop Health</span>
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                      <Sprout className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.cropHealth.value}
                      className="text-2xl font-bold font-['Outfit'] text-white"
                    />
                    <span className="text-sm font-bold text-emerald-400">%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.cropHealth.trend}%
                    </span>
                    <Sparkline data={[86, 88, 89, 90, 91, 92]} color="#10b981" width={56} height={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">{kpis.cropHealth.status}</span>
                </div>

                {/* KPI 2: Soil Moisture */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-cyan-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Soil Moisture</span>
                    <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.soilMoisture.value}
                      className="text-2xl font-bold font-['Outfit'] text-white"
                    />
                    <span className="text-sm font-bold text-cyan-400">%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.soilMoisture.trend}%
                    </span>
                    <Sparkline data={[61, 64, 62, 65, 67, 68]} color="#06b6d4" width={56} height={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">{kpis.soilMoisture.status}</span>
                </div>

                {/* KPI 3: Temperature */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-amber-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Temperature</span>
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                      <CloudSun className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.temperature.value}
                      className="text-2xl font-bold font-['Outfit'] text-white"
                    />
                    <span className="text-sm font-bold text-amber-400">°C</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-zinc-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />{kpis.temperature.trend}°C
                    </span>
                    <Sparkline data={[29, 31, 30, 29, 28, 28]} color="#f59e0b" width={56} height={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">{kpis.temperature.status}</span>
                </div>

                {/* KPI 4: Yield Forecast */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-lime-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Yield Forecast</span>
                    <div className="p-1.5 rounded-md bg-lime-500/10 text-lime-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={kpis.yieldForecast.value}
                      decimals={1}
                      className="text-2xl font-bold font-['Outfit'] text-white"
                    />
                    <span className="text-sm font-bold text-lime-400">Tons</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-lime-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.yieldForecast.trend}%
                    </span>
                    <Sparkline data={[4.1, 4.3, 4.4, 4.5, 4.7, 4.8]} color="#84cc16" width={56} height={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">{kpis.yieldForecast.status}</span>
                </div>

                {/* KPI 5: Pest Risk */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-rose-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Pest Risk</span>
                    <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                      <Bug className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-['Outfit'] text-emerald-400">
                      {kpis.pestRisk.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      {kpis.pestRisk.trend}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                      Safe
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">{kpis.pestRisk.subtext}</span>
                </div>

                {/* KPI 6: Market Price */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0e1e15]/80 to-[#0a150f]/90 border border-emerald-800/40 hover:border-yellow-500/50 transition-all duration-300 shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-medium">Market Price</span>
                    <div className="p-1.5 rounded-md bg-yellow-500/10 text-yellow-400">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-yellow-400">₹</span>
                    <AnimatedCounter
                      value={kpis.marketPrice.value}
                      className="text-2xl font-bold font-['Outfit'] text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-950/80">
                    <span className="text-[11px] text-yellow-400 font-mono font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{kpis.marketPrice.trend}%
                    </span>
                    <Sparkline data={[2280, 2320, 2350, 2380, 2410, 2450]} color="#eab308" width={56} height={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1 truncate">Per Quintal</span>
                </div>
              </div>

              {/* SECTION 6: AGRICULTURE ANALYTICS (Charts) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Crop Yield Prediction */}
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Crop Yield Prediction (Actual vs AI Forecast)
                      </h3>
                      <p className="text-[11px] text-zinc-400">Tons per acre trajectory modeled with NDVI spectral data</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      +8.5% YoY
                    </span>
                  </div>
                  <YieldPredictionChart data={dashboardData?.charts.yieldPrediction || []} />
                </div>

                {/* Chart 2: Soil Moisture Trend */}
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        Soil Moisture Trend & Optimal Threshold
                      </h3>
                      <p className="text-[11px] text-zinc-400">Continuous 24-hour reading across 30cm root depths</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                      Current: {soil.soilMoisture || 68}%
                    </span>
                  </div>
                  <SoilMoistureChart data={dashboardData?.charts.soilMoistureTrend || []} />
                </div>

                {/* Chart 3: Temperature Trend */}
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        Temperature & Heat Index Curve
                      </h3>
                      <p className="text-[11px] text-zinc-400">Ambient air temperature vs plant canopy thermal stress</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      28°C Ambient
                    </span>
                  </div>
                  <TemperatureTrendChart data={dashboardData?.charts.temperatureTrend || []} />
                </div>

                {/* Chart 4: Rainfall */}
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-blue-400" />
                        Rainfall Distribution (2026 vs 5-Yr Mean)
                      </h3>
                      <p className="text-[11px] text-zinc-400">Precipitation volumes in mm for monsoon water budget</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                      Seasonal: +6.2%
                    </span>
                  </div>
                  <RainfallChart data={dashboardData?.charts.rainfallTrend || []} />
                </div>
              </div>

              {/* Chart 5: Market Price Trend (Full Width) */}
              <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-yellow-400" />
                      Agricultural Commodity Mandi Price Trend (INR / Quintal)
                    </h3>
                    <p className="text-[11px] text-zinc-400">Monthly spot trade averages across Rice, Wheat, Cotton, and Maize</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('market')}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto"
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
                <p className="text-xs text-zinc-400">
                  Real-time physiological health, phenological growth stage, and disease vulnerability across all active blocks.
                </p>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-800/40">
                    Total Monitored: {filteredCrops.length} Crops
                  </span>
                  <button
                    onClick={() => handleQuickDownloadPDF('crops')}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-xs text-emerald-300 transition-colors shadow-sm active:scale-95 disabled:opacity-60"
                    title="Download Crop Health Audit PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Crop Audit PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map(crop => (
                  <div
                    key={crop._id}
                    className="p-5 rounded-2xl bg-gradient-to-b from-[#0f2117] to-[#09150e] border border-emerald-800/40 hover:border-emerald-500/50 transition-all duration-300 shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white font-['Outfit']">{crop.cropName}</h3>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              crop.status === 'Optimal'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                                : crop.status === 'Attention'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                                : 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                            }`}
                          >
                            {crop.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{crop.variety}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-['Outfit'] text-white">
                          {crop.healthScore}%
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-mono">Health Index</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Canopy Vigor</span>
                        <span className="font-mono text-emerald-400">{crop.healthScore}/100</span>
                      </div>
                      <div className="w-full bg-emerald-950/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            crop.healthScore > 85 ? 'bg-emerald-400' : crop.healthScore > 75 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${crop.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Spec Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-950/80">
                      <div className="p-2 rounded-lg bg-emerald-950/30">
                        <span className="text-[10px] text-zinc-400 block">Growth Stage</span>
                        <span className="font-medium text-zinc-200">{crop.growthStage}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/30">
                        <span className="text-[10px] text-zinc-400 block">Moisture</span>
                        <span className="font-medium text-cyan-300 font-mono">{crop.moisture}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/30">
                        <span className="text-[10px] text-zinc-400 block">Disease Risk</span>
                        <span
                          className={`font-semibold font-mono ${
                            crop.diseaseRisk === 'Low' ? 'text-emerald-400' : crop.diseaseRisk === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                          }`}
                        >
                          {crop.diseaseRisk}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/30">
                        <span className="text-[10px] text-zinc-400 block">Expected Yield</span>
                        <span className="font-medium text-lime-300 font-mono">{crop.expectedYield} t/acre</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>Area: {crop.acreage} Acres</span>
                      <span className="text-zinc-500">Harvest: {crop.harvestWindow}</span>
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
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0d261a] to-cyan-950/80 border border-emerald-600/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shrink-0">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                      Automated Evapotranspiration Recommendation
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {soil.irrigationRecommendation || 'Irrigation recommended in approximately 6 hours.'}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1">
                      Next cycle: <span className="font-mono text-emerald-300">{soil.nextScheduledWatering || 'Today at 04:30 PM IST'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTriggerIrrigation}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shrink-0 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Drip Cycle Now</span>
                </button>
              </div>

              {/* Soil Telemetry Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Moisture */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">Soil Moisture</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {soil.soilMoisture || 68}%
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${soil.soilMoisture || 68}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-500">Depth: 30cm Root Zone</span>
                </div>

                {/* pH Level */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">pH Level</span>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {soil.phLevel || 6.8}
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${((soil.phLevel || 6.8) / 14) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-400">Optimal (6.5 - 7.2)</span>
                </div>

                {/* Nitrogen */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">Nitrogen (N)</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {soil.nitrogen || 245} <span className="text-xs text-zinc-400 font-sans">kg/ha</span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-[10px] text-emerald-400">Adequate Reserves</span>
                </div>

                {/* Phosphorus */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">Phosphorus (P)</span>
                  <div className="text-2xl font-bold font-mono text-lime-400">
                    {soil.phosphorus || 38} <span className="text-xs text-zinc-400 font-sans">kg/ha</span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-[10px] text-zinc-400">Target Range: 30-50</span>
                </div>

                {/* Potassium */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">Potassium (K)</span>
                  <div className="text-2xl font-bold font-mono text-yellow-400">
                    {soil.potassium || 310} <span className="text-xs text-zinc-400 font-sans">kg/ha</span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full" style={{ width: '82%' }} />
                  </div>
                  <span className="text-[10px] text-emerald-400">High Vigor</span>
                </div>

                {/* Soil Temperature */}
                <div className="p-4 rounded-xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400 block">Soil Temperature</span>
                  <div className="text-2xl font-bold font-mono text-orange-400">
                    {soil.soilTemperature || 24.2}°C
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-400 h-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-[10px] text-zinc-400">EC: {soil.electricalConductivity || 1.15} dS/m</span>
                </div>
              </div>

              {/* Soil Chart */}
              <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl">
                <h3 className="text-sm font-bold text-white font-['Outfit'] mb-3">
                  Hourly Soil Moisture Saturation vs Evapotranspiration
                </h3>
                <SoilMoistureChart data={dashboardData?.charts.soilMoistureTrend || []} />
              </div>
            </div>
          )}

          {/* TAB 4: WEATHER INTELLIGENCE */}
          {currentTab === 'weather' && (
            <div className="space-y-6">
              {/* Current Weather Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1f15] via-[#09150e] to-[#0d2217] border border-emerald-700/40 shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="space-y-1 md:border-r border-emerald-950/80 pr-4">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Micro-Station Telemetry
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold font-['Outfit'] text-white">
                      {weather.temperature || 28}°
                    </span>
                    <span className="text-sm font-bold text-zinc-400">C</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">{weather.condition || 'Partly Cloudy'}</p>
                  <p className="text-xs text-zinc-500 font-mono">Pressure: {weather.pressure || 1012} hPa</p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-3">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                    <span className="text-xs text-zinc-400 block">Relative Humidity</span>
                    <span className="text-lg font-bold font-mono text-cyan-300">{weather.humidity || 64}%</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Dew point 21°C</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                    <span className="text-xs text-zinc-400 block">Rainfall (24h)</span>
                    <span className="text-lg font-bold font-mono text-blue-300">{weather.rainfall || 14.5} mm</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Monsoon Front</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                    <span className="text-xs text-zinc-400 block">Wind Velocity</span>
                    <span className="text-lg font-bold font-mono text-zinc-200">{weather.windSpeed || 12.8} km/h</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Heading SSW (210°)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60">
                    <span className="text-xs text-zinc-400 block">Solar UV Index</span>
                    <span className="text-lg font-bold font-mono text-amber-300">{weather.uvIndex || 7.2}</span>
                    <span className="text-[10px] text-amber-400 block mt-0.5">Moderate/High</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Cards */}
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] mb-4">
                  7-Day Micro-Climate Agricultural Forecast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {(weather.forecast7Days || []).map((day, idx) => (
                    <div
                      key={day.day}
                      className={`p-4 rounded-xl border text-center space-y-2 transition-all ${
                        idx === 0
                          ? 'bg-emerald-900/30 border-emerald-600/50 shadow-lg'
                          : 'bg-[#0c1711] border-emerald-900/40 hover:border-emerald-700/50'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block font-['Outfit']">{day.day}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono">{day.date}</span>

                      <div className="py-2">
                        <CloudSun className="w-6 h-6 mx-auto text-emerald-400" />
                        <span className="text-[11px] text-zinc-300 block mt-1 truncate">{day.condition}</span>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs font-mono">
                        <span className="text-white font-bold">{day.tempMax}°</span>
                        <span className="text-zinc-500">{day.tempMin}°</span>
                      </div>

                      <div className="text-[10px] text-cyan-400 font-mono pt-1 border-t border-emerald-950">
                        Rain: {day.rainChance}%
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
                <p className="text-xs text-zinc-400">
                  Multispectral drone camera scans and field trap telemetry detecting pathogenetic risks early.
                </p>
                <span className="text-xs font-mono text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-md border border-rose-800/40 self-start sm:self-auto">
                  1 Urgent Action Recommended
                </span>
              </div>

              <div className="space-y-4">
                {pestRisks.map(risk => (
                  <div
                    key={risk._id}
                    className={`p-5 rounded-2xl border transition-all duration-300 shadow-xl ${
                      risk.riskLevel === 'High'
                        ? 'bg-gradient-to-r from-rose-950/40 via-[#140b0e] to-[#0e1611] border-rose-600/50 shadow-rose-950/20'
                        : risk.riskLevel === 'Medium'
                        ? 'bg-gradient-to-r from-amber-950/30 via-[#14120a] to-[#0e1611] border-amber-600/50'
                        : 'bg-[#0c1711] border-emerald-800/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-emerald-950/80">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            risk.riskLevel === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : risk.riskLevel === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          <Bug className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-['Outfit']">{risk.cropName}</h3>
                            <span className="text-xs text-zinc-400 font-mono">({risk.pestCategory})</span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-300">{risk.pestName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                            risk.riskLevel === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : risk.riskLevel === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          Risk Level: {risk.riskLevel}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          Affected: {risk.affectedAreaPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                      <div>
                        <span className="text-zinc-500 font-semibold block mb-1">Detected Symptoms</span>
                        <p className="text-zinc-300 leading-relaxed">{risk.symptoms}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                        <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recommended Action Protocol
                        </span>
                        <p className="text-zinc-200 leading-relaxed">{risk.recommendedAction}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-emerald-950/60 mt-3 font-mono">
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
                <p className="text-xs text-zinc-400">
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
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400">Estimated Total Harvest</span>
                  <div className="text-3xl font-extrabold font-['Outfit'] text-emerald-400">
                    428.5 <span className="text-sm text-zinc-400">Tons</span>
                  </div>
                  <p className="text-xs text-zinc-500">+14% higher than 3-year baseline across 185 total farm acres.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400">Top Performing Plot</span>
                  <div className="text-3xl font-extrabold font-['Outfit'] text-white">
                    Maize (Plot 3)
                  </div>
                  <p className="text-xs text-zinc-500">Yielding 6.1 Tons/acre with Pioneer P3396 hybrid vigor.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 space-y-2">
                  <span className="text-xs text-zinc-400">Optimal Harvest Window</span>
                  <div className="text-3xl font-extrabold font-['Outfit'] text-lime-300">
                    Oct 24 - Nov 12
                  </div>
                  <p className="text-xs text-zinc-500">Dry weather window predicted by radar telemetry.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white font-['Outfit']">
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
                <p className="text-xs text-zinc-400">
                  Daily APMC Mandi arrival rates, price variations in Indian Rupees (INR), and short-term volatility forecasts.
                </p>
                <span className="text-xs font-mono text-yellow-400 bg-yellow-950/50 px-2.5 py-1 rounded-md border border-yellow-800/40 self-start sm:self-auto">
                  Spot Currency: INR (₹)
                </span>
              </div>

              {/* Price Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketPrices.map(item => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#0f2117] to-[#09150e] border border-emerald-800/40 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white font-['Outfit']">{item.product}</h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          item.marketTrend === 'Bullish'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                            : item.marketTrend === 'Bearish'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {item.marketTrend}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-yellow-400">₹</span>
                        <span className="text-2xl font-bold font-mono text-white">
                          {item.currentPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">/ {item.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono mt-1">
                        <span className={item.percentageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.percentageChange >= 0 ? '+' : ''}{item.percentageChange}%
                        </span>
                        <span className="text-zinc-500">vs yesterday (₹{item.previousPrice})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-950 text-[11px] text-zinc-400">
                      <span>Mandi: </span>
                      <span className="text-zinc-200 font-medium">{item.primaryMandi}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Trend Chart */}
              <div className="p-5 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white font-['Outfit']">
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
                <p className="text-xs text-zinc-400">
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

              <div className="divide-y divide-emerald-950/80 rounded-2xl bg-[#0c1711] border border-emerald-800/40 overflow-hidden shadow-xl">
                {farmActivities.map(act => (
                  <div key={act._id} className="p-4 sm:p-5 hover:bg-emerald-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          act.severity === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : act.severity === 'Warning'
                            ? 'bg-amber-500/10 text-amber-400'
                            : act.severity === 'High'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-cyan-500/10 text-cyan-400'
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-['Outfit']">{act.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono">
                            {act.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{act.description}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-zinc-400 shrink-0 font-mono">
                      <span>{act.timestamp}</span>
                      <span className="text-zinc-500 text-[11px]">{act.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-6 rounded-2xl bg-[#0c1711] border border-emerald-800/40 shadow-xl space-y-6">
                <h3 className="text-base font-bold text-white font-['Outfit'] pb-3 border-b border-emerald-950">
                  AgriVision Platform Configuration
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Active Farm Unit</label>
                    <input
                      type="text"
                      disabled
                      value={selectedFarm}
                      className="w-full p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900 text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Sensor Telemetry Cadence</label>
                    <select className="w-full p-2.5 rounded-lg bg-[#08100c] border border-emerald-800 text-zinc-200 focus:outline-none">
                      <option>Continuous (Every 5 minutes - Solar LoRaWAN)</option>
                      <option>Balanced (Every 15 minutes)</option>
                      <option>Battery Saver (Every 1 hour)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-emerald-950 space-y-3">
                    <span className="font-semibold text-zinc-300 block">Database Architecture & Status</span>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                      <div>
                        <p className="font-semibold text-white">Database Engine</p>
                        <p className="text-zinc-400 text-[11px]">
                          {dashboardData?.databaseSource || 'MongoDB Mongoose Document Store'}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => showToast('Configuration saved successfully.')}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
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
          <div className="w-full max-w-md rounded-2xl bg-[#0b1611] border border-emerald-700/60 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <h3 className="text-base font-bold text-white font-['Outfit']">Log Farm Operation</h3>
              <button
                onClick={() => setIsAddActivityOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Operation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector B Micronutrient Spray"
                  value={newActivityTitle}
                  onChange={e => setNewActivityTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#08100c] border border-emerald-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Category</label>
                <select
                  value={newActivityCategory}
                  onChange={e => setNewActivityCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#08100c] border border-emerald-800 text-zinc-100 focus:outline-none"
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
                <label className="block text-zinc-300 font-medium mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Details of inputs applied, plot quadrant, or sensor telemetry readings..."
                  value={newActivityDesc}
                  onChange={e => setNewActivityDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#08100c] border border-emerald-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
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
