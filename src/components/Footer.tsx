import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Shield,
  Cpu,
  CloudRain,
  ArrowUpRight,
  CheckCircle2,
  Satellite,
  Radio,
  Mail,
  Send,
  Globe,
  ChevronUp,
  Phone,
  MapPin,
  Sparkles,
  Lock,
  Layers,
  Activity,
  FileText,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 6000);
    }, 700);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="agrivision-premium-footer"
      className={`relative overflow-hidden transition-colors duration-300 border-t ${
        isDark
          ? 'bg-[#040806] border-emerald-950/80 text-zinc-400'
          : 'bg-[#f8faf9] border-emerald-100 text-slate-600'
      }`}
    >
      {/* Ambient background glow accents */}
      <div
        className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${
          isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/10'
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${
          isDark ? 'bg-emerald-900/10' : 'bg-teal-300/10'
        }`}
      />

      {/* TOP TICKER RIBBON: Live Planetary & Edge Node Telemetry */}
      <div
        className={`border-b text-xs transition-colors duration-300 ${
          isDark
            ? 'bg-[#060e0a]/90 border-emerald-950/60'
            : 'bg-white/80 border-slate-200 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className={isDark ? 'text-zinc-300' : 'text-slate-800'}>
                  Telemetry Network:
                </span>
                <span className="font-mono text-emerald-500 font-semibold">
                  1,420 Active Edge Nodes
                </span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                <Satellite className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sentinel-2 Raster:</span>
                <span className="font-mono text-emerald-500">Synced (142ms)</span>
              </span>

              <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mandi Price Ticker:</span>
                <span className="font-mono text-emerald-500">24 Markets Live</span>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span
                className={`px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                }`}
              >
                99.98% SLA
              </span>
              <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                Kaveri Cluster: Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 relative z-10">
        {/* UPPER CALLOUT CARD: Agronomic Dispatch & Bulletin Newsletter */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border mb-14 shadow-sm relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-emerald-950/40 via-[#07130d] to-emerald-950/30 border-emerald-800/40'
              : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50/60 border-emerald-200'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                Agronomic Intelligence Dispatch
              </div>
              <h3
                className={`text-xl sm:text-2xl font-bold font-['Outfit'] tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Get Real-Time Agro Climate & Mandi Bulletins
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'text-zinc-300' : 'text-slate-600'
                }`}
              >
                Subscribe to weekly multi-spectral crop NDVI summaries, monsoon rainfall probability radar, and APMC market price prediction models.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex-1 max-w-md w-full flex flex-col sm:flex-row items-stretch gap-2.5"
            >
              <div className="relative flex-1">
                <Mail
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-zinc-400' : 'text-slate-400'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter agronomist or farm email..."
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all outline-none ${
                    isDark
                      ? 'bg-[#08150f] border-emerald-800/50 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || subscribed}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 shrink-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {subscribed && (
            <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Welcome to the AgriVision Bulletin. Your localized telemetry briefing is on the way!</span>
            </div>
          )}
        </div>

        {/* 5-COLUMN RICH DIRECTORY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 mb-14">
          {/* Column 1: Brand & Regional Telemetry */}
          <div className="space-y-4 lg:col-span-2 pr-0 lg:pr-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl border ${
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950/60'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-xs'
                }`}
              >
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-xl font-bold font-['Outfit'] tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Agri<span className="text-emerald-500">Vision</span>
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                  Precision Agro OS v2.4
                </span>
              </div>
            </div>

            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-zinc-300' : 'text-slate-600'
              }`}
            >
              Enterprise-grade precision agriculture intelligence platform uniting edge IoT soil sensors, hyperspectral canopy analysis, autonomous irrigation scheduling, and APMC Mandi market forecasts.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div
                className={`flex items-center gap-2 ${
                  isDark ? 'text-zinc-300' : 'text-slate-600'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Kisan Telemetry Hotline: <strong className="font-mono text-emerald-600 dark:text-emerald-400">1800-419-AGRI</strong></span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isDark ? 'text-zinc-300' : 'text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AgriTech Innovations Lab, Bengaluru & Kaveri Agro Zone</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all group border ${
                  isDark
                    ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-700/50 shadow-sm shadow-emerald-950/40'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Launch Live Agro Telemetry</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Column 2: Intelligence Modules */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-200' : 'text-slate-900'
              }`}
            >
              Intelligence Suites
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>Crop Health & NDVI</span>
                  <span className="text-[10px] font-mono text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>Soil Moisture & NPK</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>Precision Irrigation</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>Pest & Pathogen Vision</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-mono">
                    AI
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>Yield Harvest Predictor</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center justify-between group transition-colors ${
                    isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600 text-slate-600'
                  }`}
                >
                  <span>APMC Mandi Intelligence</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Agronomic Research & Benchmarks */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-200' : 'text-slate-900'
              }`}
            >
              Research & Protocols
            </h4>
            <ul className="space-y-2 text-xs">
              <li className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>ICAR Norms Aligned</span>
              </li>
              <li className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Soil Health Card v2</span>
              </li>
              <li className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <CloudRain className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>IMD Doppler Satellite</span>
              </li>
              <li className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Kharif / Rabi Biomass</span>
              </li>
              <li className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Open Geospatial (OGC)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Infrastructure & Nodes */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-zinc-200' : 'text-slate-900'
              }`}
            >
              Regional Node Clusters
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                  Kaveri Basin (Rice/Wheat)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  99.9%
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                  Punjab Plains (Basmati)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ONLINE
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                  Nashik Horticultural Hub
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ONLINE
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                  Telangana Cotton Corridor
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  SYNCING
                </span>
              </li>
              <li className="pt-2">
                <div
                  className={`p-2 rounded-lg border text-[11px] ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-800/30 text-zinc-400'
                      : 'bg-emerald-50/70 border-emerald-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Lock className="w-3 h-3" />
                    <span>256-Bit Hardware Encrypted</span>
                  </div>
                  <p className="text-[10px] mt-0.5 opacity-80">
                    Protected under National AgTech Data Sovereignty.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* TRUST ACCREDITATION BADGES BAR */}
        <div
          className={`py-5 px-6 rounded-xl border mb-10 flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark
              ? 'bg-[#060c09] border-emerald-950/70'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-wrap items-center gap-6">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}
            >
              Industry Compliance:
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ICAR Validated
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              IMD Doppler Radar v3
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Soil Health Card Schema
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ISO 27001 Security
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToTop}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/40 text-emerald-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span>Back to top</span>
              <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div
          className={`pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left ${
            isDark ? 'border-emerald-950/60 text-zinc-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div className="space-y-1">
            <p>
              © {currentYear} AgriVision Intelligence Technologies Inc. Built for sustainable precision farming.
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-400">
              Transforming raw IoT telemetry & satellite rasters into sovereign agronomic decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 text-[11px]">
            <span className="font-mono">Server: Node.js / Express</span>
            <span className="font-mono">Storage: MongoDB Engine</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
