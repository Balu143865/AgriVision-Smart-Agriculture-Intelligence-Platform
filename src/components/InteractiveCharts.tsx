import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const useChartColors = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    gridStroke: isDark ? '#172b20' : '#e2e8f0',
    axisColor: isDark ? '#527962' : '#94a3b8',
    tickColor: isDark ? '#7fa391' : '#64748b',
    barHistorical: isDark ? '#1e3a5f' : '#cbd5e1',
  };
};

// Custom responsive & theme-aware tooltip styling
export const CustomChartTooltip = ({ active, payload, label, unit = '' }: any) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (active && payload && payload.length) {
    return (
      <div
        className={`p-2.5 sm:p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs pointer-events-none select-none max-w-[240px] sm:max-w-xs transition-all z-50 ${
          isDark
            ? 'bg-[#0b1611]/95 border-emerald-800/60 text-white shadow-black/80'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
        }`}
      >
        <p
          className={`font-semibold mb-1 pb-1 border-b text-[11px] truncate ${
            isDark ? 'text-zinc-200 border-emerald-950/80' : 'text-slate-800 border-slate-100'
          }`}
        >
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 py-0.5">
              <span className="flex items-center gap-1.5 truncate" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className={`capitalize truncate text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {item.name}:
                </span>
              </span>
              <span className={`font-mono font-bold shrink-0 ml-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.value} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Chart 1: Crop Yield Prediction
export const YieldPredictionChart: React.FC<{ data: any[] }> = ({ data }) => {
  const { isDark, gridStroke, axisColor, tickColor } = useChartColors();

  return (
    <div className="w-full h-56 sm:h-72 min-h-[220px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -6, bottom: 4 }}>
          <defs>
            <linearGradient id="predYieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="actualYieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="month"
            stroke={axisColor}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <YAxis
            stroke={axisColor}
            tickLine={false}
            domain={[2, 6]}
            unit="t"
            width={32}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomChartTooltip unit="Tons/ac" />} />
          <Area
            type="monotone"
            dataKey="predicted"
            name="AI Forecast"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#predYieldGrad)"
            activeDot={{ r: 5, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Measured"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#actualYieldGrad)"
            activeDot={{ r: 5, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 2: Soil Moisture Trend
export const SoilMoistureChart: React.FC<{ data: any[] }> = ({ data }) => {
  const { isDark, gridStroke, axisColor, tickColor } = useChartColors();

  return (
    <div className="w-full h-56 sm:h-72 min-h-[220px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -6, bottom: 4 }}>
          <defs>
            <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={axisColor}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={14}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <YAxis
            stroke={axisColor}
            tickLine={false}
            domain={[40, 90]}
            unit="%"
            width={34}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomChartTooltip unit="%" />} />
          <Area
            type="monotone"
            dataKey="moisture"
            name="Moisture"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#moistureGrad)"
            activeDot={{ r: 5, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="optimalMin"
            name="Opt Min"
            stroke="#84cc16"
            strokeDasharray="3 3"
            dot={false}
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="optimalMax"
            name="Opt Max"
            stroke="#eab308"
            strokeDasharray="3 3"
            dot={false}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 3: Temperature Trend
export const TemperatureTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const { isDark, gridStroke, axisColor, tickColor } = useChartColors();

  return (
    <div className="w-full h-56 sm:h-72 min-h-[220px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -6, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={axisColor}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={14}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <YAxis
            stroke={axisColor}
            tickLine={false}
            domain={[18, 38]}
            unit="°C"
            width={34}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomChartTooltip unit="°C" />} />
          <Line
            type="monotone"
            dataKey="temp"
            name="Ambient"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: '#f59e0b' }}
            activeDot={{ r: 6, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="feelsLike"
            name="Thermal Index"
            stroke="#ef4444"
            strokeWidth={1.8}
            strokeDasharray="3 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 4: Rainfall
export const RainfallChart: React.FC<{ data: any[] }> = ({ data }) => {
  const { gridStroke, axisColor, tickColor, barHistorical } = useChartColors();

  return (
    <div className="w-full h-56 sm:h-72 min-h-[220px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -6, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="month"
            stroke={axisColor}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <YAxis
            stroke={axisColor}
            tickLine={false}
            unit="mm"
            width={34}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomChartTooltip unit="mm" />} />
          <Bar
            dataKey="rainfall"
            name="Measured"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="avgRainfall"
            name="5-Yr Avg"
            fill={barHistorical}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 5: Market Price Trend
export const MarketPriceTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  const { isDark, gridStroke, axisColor, tickColor } = useChartColors();

  return (
    <div className="w-full h-64 sm:h-72 md:h-80 min-h-[240px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="month"
            stroke={axisColor}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <YAxis
            stroke={axisColor}
            tickLine={false}
            domain={['auto', 'auto']}
            unit="₹"
            width={44}
            tick={{ fill: tickColor, fontSize: 10 }}
          />
          <Tooltip content={<CustomChartTooltip unit="₹/Qtl" />} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              paddingBottom: '12px',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          />
          <Line
            type="monotone"
            dataKey="cotton"
            name="Cotton"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            activeDot={{ r: 6, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="rice"
            name="Rice"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 6, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="wheat"
            name="Wheat"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 6, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="maize"
            name="Maize"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 6, stroke: isDark ? '#0c1711' : '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
