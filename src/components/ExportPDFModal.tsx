import React, { useState } from 'react';
import {
  FileDown,
  X,
  CheckCircle2,
  FileText,
  Sprout,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Loader2,
  Download,
} from 'lucide-react';
import { generateCropAndYieldPDF } from '../utils/pdfGenerator';
import { ICrop, IDashboardSummary, IPestRisk } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmName: string;
  agronomistName?: string;
  crops: ICrop[];
  dashboardData?: IDashboardSummary | null;
  pestRisks?: IPestRisk[];
  onSuccessToast: (msg: string) => void;
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({
  isOpen,
  onClose,
  farmName,
  agronomistName = 'Dr. Ramesh Sundaram',
  crops,
  dashboardData,
  pestRisks = [],
  onSuccessToast,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [reportType, setReportType] = useState<'full' | 'crops' | 'yield'>('full');
  const [customSignoff, setCustomSignoff] = useState(agronomistName);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      try {
        generateCropAndYieldPDF({
          farmName,
          agronomistName: customSignoff || 'Lead Agronomist',
          crops,
          dashboardData,
          pestRisks,
          reportType,
        });

        onSuccessToast('Crop & Yield Intelligence PDF generated successfully!');
        onClose();
      } catch (err) {
        console.error('PDF generation error:', err);
        onSuccessToast('Error generating PDF. Please retry.');
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-5 text-xs relative transition-all ${
        isDark
          ? 'bg-[#0b1611] border-emerald-700/60 text-zinc-300'
          : 'bg-white border-slate-200 text-slate-700 shadow-xl'
      }`}>
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b ${
          isDark ? 'border-emerald-900/60' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Export Intelligence Audit Report
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Generate production-ready PDF documentation for stakeholders & agronomists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Scope Selector */}
        <div className="space-y-2">
          <label className={`block font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Select Intelligence Scope</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Scope 1: Comprehensive */}
            <button
              type="button"
              onClick={() => setReportType('full')}
              className={`p-3 rounded-xl border text-left transition-all ${
                reportType === 'full'
                  ? isDark
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                  : isDark
                  ? 'bg-emerald-950/20 border-emerald-900/60 text-zinc-400 hover:border-emerald-700/60'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-xs ${reportType === 'full' ? (isDark ? 'text-white' : 'text-emerald-900') : (isDark ? 'text-zinc-200' : 'text-slate-800')}`}>Full Audit</span>
                {reportType === 'full' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className={`text-[10px] leading-tight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Crop health, NDVI, yield projections & ICAR recommendations.
              </p>
            </button>

            {/* Scope 2: Crop Health */}
            <button
              type="button"
              onClick={() => setReportType('crops')}
              className={`p-3 rounded-xl border text-left transition-all ${
                reportType === 'crops'
                  ? isDark
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                  : isDark
                  ? 'bg-emerald-950/20 border-emerald-900/60 text-zinc-400 hover:border-emerald-700/60'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-xs flex items-center gap-1 ${reportType === 'crops' ? (isDark ? 'text-white' : 'text-emerald-900') : (isDark ? 'text-zinc-200' : 'text-slate-800')}`}>
                  <Sprout className="w-3 h-3 text-emerald-500" />
                  Crop Health
                </span>
                {reportType === 'crops' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className={`text-[10px] leading-tight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Canopy vigor, growth stages, moisture levels & pest alerts.
              </p>
            </button>

            {/* Scope 3: Yield Analytics */}
            <button
              type="button"
              onClick={() => setReportType('yield')}
              className={`p-3 rounded-xl border text-left transition-all ${
                reportType === 'yield'
                  ? isDark
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                  : isDark
                  ? 'bg-emerald-950/20 border-emerald-900/60 text-zinc-400 hover:border-emerald-700/60'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-xs flex items-center gap-1 ${reportType === 'yield' ? (isDark ? 'text-white' : 'text-emerald-900') : (isDark ? 'text-zinc-200' : 'text-slate-800')}`}>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  Yield Forecast
                </span>
                {reportType === 'yield' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className={`text-[10px] leading-tight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Historical harvest yields, multi-month AI forecasts & variance.
              </p>
            </button>
          </div>
        </div>

        {/* Report Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Active Farm Unit</label>
            <input
              type="text"
              disabled
              value={farmName}
              className={`w-full p-2.5 rounded-lg border font-medium cursor-not-allowed ${
                isDark
                  ? 'bg-emerald-950/40 border-emerald-900 text-zinc-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            />
          </div>

          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Agronomist Sign-Off</label>
            <input
              type="text"
              value={customSignoff}
              onChange={e => setCustomSignoff(e.target.value)}
              placeholder="e.g. Dr. Ramesh Sundaram"
              className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-emerald-500 transition-colors ${
                isDark
                  ? 'bg-[#08100c] border-emerald-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Included Data Snapshot */}
        <div className={`p-3 rounded-xl border space-y-2 ${
          isDark
            ? 'bg-emerald-950/30 border-emerald-800/40'
            : 'bg-emerald-50/60 border-emerald-100'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
            isDark ? 'text-emerald-300' : 'text-emerald-800'
          }`}>
            Report Output Specifications
          </span>
          <div className={`grid grid-cols-2 gap-2 text-[11px] ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{crops.length} Monitored Field Blocks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>AI Multi-Month Yield Forecasts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>ICAR Benchmark Compliance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>LoRaWAN Node Telemetry Certified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-75"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Compiling Vector PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
