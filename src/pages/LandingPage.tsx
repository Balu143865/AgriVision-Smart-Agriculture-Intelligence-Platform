import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  Sprout,
  Droplets,
  CloudSun,
  Bug,
  TrendingUp,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Radio,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Layers,
  Database,
  Satellite,
  Compass,
  ChevronDown,
  ArrowUp,
  Scan,
  Activity,
  Eye,
  Maximize2,
  X,
} from 'lucide-react';
import { ParticleBackground } from '../components/ParticleBackground';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [spectralMode, setSpectralMode] = useState<'rgb' | 'ndvi' | 'thermal'>('rgb');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featureCards = [
    {
      title: 'Crop Intelligence',
      description: 'Multispectral NDVI canopy tracking, chlorophyll health indexing, and automated phenological growth staging across Indian staples.',
      icon: Sprout,
      badge: '92% Health Index',
      accent: 'from-emerald-500/20 to-lime-500/10',
      border: 'group-hover:border-emerald-500/50',
    },
    {
      title: 'Soil Monitoring',
      description: 'Real-time root-depth moisture telemetry, NPK nutrient ratio analysis, pH balancing, and smart evapotranspiration modeling.',
      icon: Droplets,
      badge: '68% Root Saturation',
      accent: 'from-cyan-500/20 to-blue-500/10',
      border: 'group-hover:border-cyan-500/50',
    },
    {
      title: 'Weather Intelligence',
      description: 'Hyper-local micro-climate radar with 7-day precipitation probability, thermal heat index alerts, and wind vector tracking.',
      icon: CloudSun,
      badge: '28°C Ambient / 14.5mm Rain',
      accent: 'from-amber-500/20 to-orange-500/10',
      border: 'group-hover:border-amber-500/50',
    },
    {
      title: 'Pest Detection',
      description: 'Computer vision early blight detection, pink bollworm trap sensors, and automated organic bio-spray action protocols.',
      icon: Bug,
      badge: 'Drone Thermal CV Scan',
      accent: 'from-rose-500/20 to-amber-500/10',
      border: 'group-hover:border-rose-500/50',
    },
    {
      title: 'Yield Analytics',
      description: 'Predictive harvest yield forecasting combining soil telemetry, rainfall history, and ICAR regional benchmarks with 87% accuracy.',
      icon: TrendingUp,
      badge: '4.8 Tons/Acre Est.',
      accent: 'from-emerald-500/20 to-teal-500/10',
      border: 'group-hover:border-emerald-500/50',
    },
    {
      title: 'Market Intelligence',
      description: 'Live APMC Mandi price tracking in INR for Rice, Wheat, Cotton, and Maize with arrival volume metrics and trend forecasts.',
      icon: IndianRupee,
      badge: '₹2,450 / Quintal Rice',
      accent: 'from-yellow-500/20 to-emerald-500/10',
      border: 'group-hover:border-yellow-500/50',
    },
  ];

  const flowSteps = [
    {
      step: '01',
      title: 'Farm Sensors',
      desc: 'LoRaWAN moisture probes, leaf wetness sensors, and multispectral drone imagery deployed across crop fields.',
      icon: Radio,
      badge: 'IoT Edge Telemetry',
    },
    {
      step: '02',
      title: 'Agriculture Data',
      desc: 'Continuous ingestion of micro-climate telemetry, NPK core samples, and historical rainfall archives into MongoDB.',
      icon: Database,
      badge: 'Mongoose Data Pipeline',
    },
    {
      step: '03',
      title: 'AI Intelligence',
      desc: 'Machine learning algorithms correlate evapotranspiration, thermal indices, and Mandi price volatility curves.',
      icon: Cpu,
      badge: 'Predictive Analytics',
    },
    {
      step: '04',
      title: 'Actionable Insights',
      desc: 'Precision irrigation alerts, targeted pest recommendations, and optimal harvest windows pushed directly to your dashboard.',
      icon: Sparkles,
      badge: 'Prescriptive Decisions',
    },
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-300 overflow-x-clip ${
      isDark
        ? 'bg-[#08100c] text-white selection:bg-emerald-500/30 selection:text-emerald-200'
        : 'bg-[#f8faf9] text-zinc-900 selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      {/* Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300 origin-left z-[60] pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.7)]"
        style={{ scaleX }}
      />

      {/* Particle Canvas Background */}
      <ParticleBackground density={50} />

      {/* Navigation */}
      <Navbar />

      {/* Floating Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
        }}
        style={{ pointerEvents: showScrollTop ? 'auto' : 'none' }}
        transition={{ duration: 0.2 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-xl border backdrop-blur-md transition-all active:scale-95 group ${
          isDark
            ? 'bg-[#0d1f14]/90 hover:bg-[#132c1c] border-emerald-500/40 text-emerald-400 shadow-xl shadow-black/60'
            : 'bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xl shadow-emerald-900/10'
        }`}
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
      </motion.button>

      {/* SECTION 1: HERO (Morning Mint & Meadow in Light Mode) */}
      <section className={`relative pt-24 pb-16 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-[#08100c]'
          : 'bg-gradient-to-b from-[#f0fdf4] via-[#f7fee7]/70 to-[#ecfdf5] border-b border-emerald-100/80'
      }`}>
        {/* Ambient background glows */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] blur-[120px] pointer-events-none ${
          isDark
            ? 'bg-gradient-to-tr from-emerald-600/15 via-lime-500/10 to-transparent'
            : 'bg-gradient-to-tr from-emerald-300/30 via-lime-200/20 to-transparent'
        }`} />
        <div className={`absolute -top-12 right-10 w-96 h-96 rounded-full blur-[100px] pointer-events-none ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/15'
        }`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-5 sm:space-y-6 text-left"
            >
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md shadow-xs border ${
                isDark
                  ? 'bg-emerald-950/70 border-emerald-700/40'
                  : 'bg-emerald-100/90 border-emerald-300'
              }`}>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[11px] sm:text-xs font-mono uppercase tracking-wider font-semibold ${
                  isDark ? 'text-emerald-300' : 'text-emerald-900'
                }`}>
                  Autonomous Precision Farming
                </span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Outfit'] leading-[1.12] ${
                isDark ? 'text-zinc-100' : 'text-slate-900'
              }`}>
                Smart Farming. <br />
                <span className={`text-transparent bg-clip-text ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-200'
                    : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700'
                }`}>
                  Better Decisions.
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed ${
                isDark ? 'text-zinc-300' : 'text-slate-700'
              }`}>
                Transform farm data into intelligent decisions with real-time crop, soil, weather and market insights.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 sm:pt-4">
                <Link
                  to="/dashboard"
                  id="hero-explore-dashboard-btn"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-[0.98] group"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-100" />
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#features"
                  id="hero-discover-features-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm backdrop-blur-md transition-all border ${
                    isDark
                      ? 'bg-[#0e1c14]/80 hover:bg-[#152a1e] text-zinc-200 border-emerald-800/40 hover:border-emerald-600/50'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-emerald-200/90 shadow-sm hover:border-emerald-400'
                  }`}
                >
                  <span>Discover Features</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className={`pt-4 sm:pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-xs font-mono ${
                isDark ? 'border-emerald-950/60 text-zinc-400' : 'border-emerald-200/80 text-slate-600'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Indian Mandi Rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>LoRaWAN IoT Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>MongoDB Live Engine</span>
                </div>
              </div>

              {/* Scroll To Explore Prompt */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 6, 0] }}
                transition={{
                  opacity: { duration: 1, delay: 0.8 },
                  y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
                className={`pt-4 hidden sm:flex items-center gap-2 transition-colors cursor-pointer w-fit ${
                  isDark ? 'text-zinc-500 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
                }`}
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="text-[11px] font-mono tracking-wider uppercase">Scroll to explore engines</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
              </motion.div>
            </motion.div>

            {/* Right Hero Visual: Futuristic Agriculture Telemetry Node with Relevant High-Res Imagery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-5 relative w-full"
            >
              <div className={`relative mx-auto max-w-lg w-full rounded-2xl p-4 sm:p-5 backdrop-blur-xl border transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#102418]/90 to-[#0b1610]/95 border-emerald-600/40 shadow-2xl shadow-black/80'
                  : 'bg-white/95 border-emerald-200/90 shadow-2xl shadow-emerald-950/10'
              }`}>
                {/* Visual Header */}
                <div className={`flex items-center justify-between pb-3.5 border-b mb-3.5 ${
                  isDark ? 'border-emerald-900/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className={`text-xs font-mono font-semibold ${
                      isDark ? 'text-emerald-300' : 'text-emerald-800 font-bold'
                    }`}>
                      LIVE AERIAL RADAR: SECTOR 4A
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      isDark
                        ? 'text-zinc-300 bg-emerald-950/70 border-emerald-800/50'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}>
                      <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                      LoRaWAN Mesh Live
                    </span>
                  </div>
                </div>

                {/* Spectral Filter Toggle Bar */}
                <div className={`flex items-center justify-between gap-1.5 mb-3 p-1 rounded-lg border text-[11px] font-mono ${
                  isDark ? 'bg-[#07130b] border-emerald-900/50' : 'bg-slate-50 border-slate-200'
                }`}>
                  <button
                    onClick={() => setSpectralMode('rgb')}
                    className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      spectralMode === 'rgb'
                        ? 'bg-emerald-600 text-white font-medium shadow-xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-emerald-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Optical RGB</span>
                  </button>
                  <button
                    onClick={() => setSpectralMode('ndvi')}
                    className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      spectralMode === 'ndvi'
                        ? 'bg-emerald-600 text-white font-medium shadow-xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-emerald-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Scan className="w-3 h-3" />
                    <span>NDVI Vigour</span>
                  </button>
                  <button
                    onClick={() => setSpectralMode('thermal')}
                    className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      spectralMode === 'thermal'
                        ? 'bg-emerald-600 text-white font-medium shadow-xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-emerald-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>Thermal Hydration</span>
                  </button>
                </div>

                {/* Photorealistic Smart Agriculture Drone & Crop Canopy Frame */}
                <div className="relative h-60 sm:h-64 rounded-xl overflow-hidden border border-emerald-600/50 group bg-black">
                  {/* High-definition Agriculture Image */}
                  <img
                    src="/smart_agri_hero.jpg"
                    alt="Autonomous Drone Field Telemetry Scanning Lush Agricultural Crop Canopy"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      spectralMode === 'ndvi'
                        ? 'contrast-125 saturate-150 brightness-105 hue-rotate-[-10deg]'
                        : spectralMode === 'thermal'
                        ? 'contrast-125 hue-rotate-[145deg] saturate-125'
                        : 'contrast-105 saturate-110'
                    }`}
                  />

                  {/* Gradient Vignette & HUD Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08100c] via-transparent to-black/40 pointer-events-none" />

                  {/* Spectral Filter tint layer */}
                  {spectralMode === 'ndvi' && (
                    <div className="absolute inset-0 bg-emerald-500/15 mix-blend-color-dodge pointer-events-none" />
                  )}
                  {spectralMode === 'thermal' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-amber-500/20 pointer-events-none" />
                  )}

                  {/* Subtle Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  {/* Real-time Autonomous Drone Laser Scan Beam */}
                  <motion.div
                    animate={{ y: [0, 230, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981] pointer-events-none"
                  />

                  {/* Top Floating Telemetry Chips */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md shadow-lg">
                      <Satellite className="w-3 h-3 text-emerald-400" />
                      <span>AGRI-DRONE: 120m AGL</span>
                    </div>

                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 backdrop-blur-md transition-colors"
                      title="Inspect High-Res Telemetry"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Floating Companion Badge: Macro Soil IoT Sensor Probe */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 gap-2">
                    <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-black/75 border border-emerald-500/40 backdrop-blur-md shadow-xl max-w-[70%]">
                      <img
                        src="/smart_soil_sensor.jpg"
                        alt="Macro Soil NPK Sensor Node"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-400/50 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono font-semibold text-emerald-300 block truncate">
                          Node #4A Probe
                        </span>
                        <span className="text-[9px] font-mono text-zinc-300 block truncate">
                          NPK 245:38:310 · pH 6.8
                        </span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400/40 backdrop-blur-md text-right shrink-0">
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase">NDVI Index</span>
                      <span className="text-xs font-mono font-bold text-emerald-300">0.86 (Optimal)</span>
                    </div>
                  </div>
                </div>

                {/* Monitored Crop Varieties in Sector */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
                  <div className={`p-2 rounded-lg border ${
                    isDark
                      ? 'bg-[#0c1a12] border-emerald-800/40'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className={`font-bold block truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Rice BPT-5204
                    </span>
                    <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Flowering · 92%
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    isDark
                      ? 'bg-[#0c1a12] border-emerald-800/40'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className={`font-bold block truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Wheat HD-2967
                    </span>
                    <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Tillering · 89%
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    isDark
                      ? 'bg-[#14180d] border-amber-800/40'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <span className={`font-bold block truncate ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      Tomato Hybrid
                    </span>
                    <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Ripening · 71%
                    </span>
                  </div>
                </div>

                {/* Mini Telemetry KPIs */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className={`p-3 rounded-xl border ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-800/40'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Forecast Yield</span>
                    <span className={`text-lg font-bold font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      4.8 Tons/acre
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">↑ +8.5% YoY</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-800/40'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <span className={`text-[11px] block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Mandi Spot Price</span>
                    <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹2,450 / Qtl
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">↑ Bullish Trend</span>
                  </div>
                </div>

                {/* Instant Dashboard link inside card */}
                <Link
                  to="/dashboard"
                  className="mt-3.5 w-full py-2.5 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98]"
                >
                  <span>Open Full Agro Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: EVERYTHING YOUR FARM NEEDS (Sunlit Golden Wheat & Harvest Amber in Light Mode) */}
      <section id="features" className={`relative py-24 scroll-mt-24 transition-colors duration-300 ${
        isDark
          ? 'bg-[#070f0b] border-t border-emerald-950/60'
          : 'bg-gradient-to-b from-[#fffbeb] via-[#fef9c3]/45 to-[#fef3c7]/60 border-t border-amber-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className={`text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDark
                ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
                : 'text-amber-900 bg-amber-100/90 border-amber-300 shadow-xs'
            }`}>
              Core Capabilities
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}>
              Everything Your Farm Needs
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
              Six synchronized intelligence engines architected for sustainable yield expansion, resource efficiency, and financial security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -4 }}
                  className={`group relative rounded-2xl p-6 border backdrop-blur-md transition-all duration-300 ${
                    isDark
                      ? `bg-gradient-to-b from-[#0f2117]/80 to-[#09150e]/90 border-emerald-800/30 ${card.border} shadow-lg shadow-black/40 hover:shadow-emerald-950/50`
                      : 'bg-white/95 border-amber-200/90 shadow-md shadow-amber-950/5 hover:border-amber-400 hover:shadow-amber-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.accent} border border-emerald-500/20 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200 font-medium'
                    }`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 font-['Outfit'] transition-colors ${
                    isDark
                      ? 'text-white group-hover:text-emerald-300'
                      : 'text-stone-900 group-hover:text-amber-800'
                  }`}>
                    {card.title}
                  </h3>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>
                    {card.description}
                  </p>

                  <div className={`mt-5 pt-4 border-t flex items-center justify-between text-xs transition-colors ${
                    isDark
                      ? 'border-emerald-950/60 text-zinc-400 group-hover:text-emerald-400'
                      : 'border-amber-100 text-stone-500 group-hover:text-amber-700 font-medium'
                  }`}>
                    <span className="font-medium">Explore telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: FROM FARM DATA TO SMART DECISIONS (Hydrological Azure in Light Mode) */}
      <section id="architecture" className={`relative py-24 scroll-mt-24 transition-colors duration-300 ${
        isDark
          ? 'bg-[#08100c] border-t border-emerald-950/60'
          : 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe]/60 to-[#bae6fd]/30 border-t border-sky-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className={`text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDark
                ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40'
                : 'text-sky-900 bg-sky-100 border-sky-300 shadow-xs'
            }`}>
              Autonomous Intelligence Loop
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              From Farm Data to Smart Decisions
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              How raw field telemetry transforms into actionable agronomist directives in milliseconds.
            </p>
          </motion.div>

          <div className="relative">
            {/* Flow Connecting line (Desktop) */}
            <div className={`hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 z-0 ${
              isDark
                ? 'bg-gradient-to-r from-emerald-600/20 via-emerald-400/60 to-emerald-600/20'
                : 'bg-gradient-to-r from-sky-300/40 via-sky-500 to-sky-300/40'
            }`} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {flowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: idx * 0.12, ease: 'easeOut' }}
                    className={`relative rounded-2xl p-6 backdrop-blur-md transition-all border ${
                      isDark
                        ? 'bg-[#0c1812]/90 border-emerald-800/40 shadow-xl'
                        : 'bg-white/95 border-sky-200 shadow-lg shadow-sky-900/5 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-2xl font-black font-mono ${
                        isDark ? 'text-emerald-500/30' : 'text-sky-300/90'
                      }`}>
                        {step.step}
                      </span>
                      <div className={`p-2.5 rounded-lg border ${
                        isDark
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-sky-50 border-sky-200 text-sky-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className={`text-base font-bold mb-2 font-['Outfit'] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {step.title}
                    </h3>

                    <p className={`text-xs leading-relaxed mb-4 ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      {step.desc}
                    </p>

                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                      isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-sky-50 text-sky-800 border-sky-200 font-medium'
                    }`}>
                      {step.badge}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: AGRICULTURE STATISTICS (Verdant Clover Emerald in Light Mode) */}
      <section id="statistics" className={`relative py-24 scroll-mt-24 transition-colors duration-300 ${
        isDark
          ? 'bg-[#070e0a] border-t border-emerald-950/60'
          : 'bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5]/70 to-[#a7f3d0]/30 border-t border-emerald-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Stat 1 */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`p-8 rounded-2xl border backdrop-blur-md transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#0f2117]/60 to-[#0a140f]/60 border-emerald-800/30 shadow-lg'
                  : 'bg-white/95 border-emerald-200 shadow-xl shadow-emerald-900/5'
              }`}
            >
              <div className={`text-5xl sm:text-6xl font-extrabold font-['Outfit'] mb-2 text-transparent bg-clip-text ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-400 to-lime-300'
                  : 'bg-gradient-to-r from-emerald-700 to-teal-800'
              }`}>
                <AnimatedCounter value={95} suffix="%" />
              </div>
              <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-emerald-950 font-bold'}`}>
                Crop Monitoring
              </h3>
              <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-zinc-400' : 'text-emerald-800/80'}`}>
                Comprehensive canopy health and moisture resolution across 14,000+ monitored acres.
              </p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className={`p-8 rounded-2xl border backdrop-blur-md transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#0f2117]/60 to-[#0a140f]/60 border-emerald-800/30 shadow-lg'
                  : 'bg-white/95 border-emerald-200 shadow-xl shadow-emerald-900/5'
              }`}
            >
              <div className={`text-5xl sm:text-6xl font-extrabold font-['Outfit'] mb-2 text-transparent bg-clip-text ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-400 to-lime-300'
                  : 'bg-gradient-to-r from-emerald-700 to-teal-800'
              }`}>
                <AnimatedCounter value={87} suffix="%" />
              </div>
              <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-emerald-950 font-bold'}`}>
                Prediction Accuracy
              </h3>
              <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-zinc-400' : 'text-emerald-800/80'}`}>
                Validated harvest yield and weather risk forecasting aligned with ICAR standards.
              </p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className={`p-8 rounded-2xl border backdrop-blur-md transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#0f2117]/60 to-[#0a140f]/60 border-emerald-800/30 shadow-lg'
                  : 'bg-white/95 border-emerald-200 shadow-xl shadow-emerald-900/5'
              }`}
            >
              <div className={`text-5xl sm:text-6xl font-extrabold font-['Outfit'] mb-2 text-transparent bg-clip-text ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-400 to-lime-300'
                  : 'bg-gradient-to-r from-emerald-700 to-teal-800'
              }`}>
                24/7
              </div>
              <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-emerald-950 font-bold'}`}>
                Farm Intelligence
              </h3>
              <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-zinc-400' : 'text-emerald-800/80'}`}>
                Continuous autonomous telemetry processing from root-zone sensors to cloud API.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA (Deep Emerald Forest Evergreen in Light Mode) */}
      <section className={`relative py-24 overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#08100c] via-[#0b1710] to-[#060c09] border-t border-emerald-950/60 text-white'
          : 'bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] border-t border-emerald-700 text-white shadow-inner'
      }`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-[120px] pointer-events-none ${
          isDark ? 'bg-emerald-500/10' : 'bg-white/10'
        }`} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 mb-2">
            <Sprout className="w-5 h-5" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit'] text-white">
            Ready to make your farm smarter?
          </h2>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${
            isDark ? 'text-zinc-300' : 'text-emerald-100'
          }`}>
            Experience real-time crop health telemetry, smart irrigation recommendations, and Mandi price intelligence on the AgriVision platform.
          </p>

          <div className="pt-4">
            <Link
              to="/dashboard"
              id="cta-open-dashboard-btn"
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 group ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white shadow-2xl shadow-emerald-950/80 border border-emerald-400/40'
                  : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-white/80 shadow-2xl shadow-black/20'
              }`}
            >
              <BarChart3 className={`w-5 h-5 ${isDark ? 'text-white' : 'text-emerald-700'}`} />
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* High-Resolution Telemetry Inspection Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full rounded-2xl bg-[#09150e] border border-emerald-500/40 shadow-2xl overflow-hidden text-white">
            <div className="flex items-center justify-between p-4 border-b border-emerald-900/60 bg-[#0c1c13]">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white font-['Outfit']">
                  Autonomous Aerial Telemetry & Canopy Spectrometry (Sector 4A)
                </span>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-950 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src="/smart_agri_hero.jpg"
                alt="High-Resolution Smart Agriculture Telemetry"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[65vh] object-contain"
              />
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/40 text-xs font-mono text-emerald-300">
                <span>Autonomous Flight Altitude: 120m</span>
                <br />
                <span>Camera Sensor: Multi-Spectral 48MP RGB+NIR</span>
              </div>
            </div>

            <div className="p-4 bg-[#08120c] border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-zinc-300">Average NDVI: <strong className="text-emerald-400">0.86</strong></span>
                <span className="text-zinc-300">Moisture Index: <strong className="text-cyan-400">68%</strong></span>
                <span className="text-zinc-300">Nitrogen Index: <strong className="text-lime-400">Optimal</strong></span>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600/70 text-white text-xs font-medium transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};
