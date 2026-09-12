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

// Custom dark/emerald tooltip styling
export const CustomChartTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1611]/95 border border-emerald-800/60 p-3 rounded-lg shadow-xl shadow-black/60 backdrop-blur-md text-xs">
        <p className="font-semibold text-zinc-200 mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-zinc-400 capitalize">{item.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {item.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Chart 1: Crop Yield Prediction
export const YieldPredictionChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#172b20" vertical={false} />
          <XAxis dataKey="month" stroke="#527962" fontSize={11} tickLine={false} />
          <YAxis stroke="#527962" fontSize={11} tickLine={false} domain={[2, 6]} unit="t" width={32} />
          <Tooltip content={<CustomChartTooltip unit="Tons/acre" />} />
          <Area
            type="monotone"
            dataKey="predicted"
            name="AI Forecast Yield"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#predYieldGrad)"
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual Measured"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#actualYieldGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 2: Soil Moisture Trend
export const SoilMoistureChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#172b20" vertical={false} />
          <XAxis dataKey="time" stroke="#527962" fontSize={11} tickLine={false} />
          <YAxis stroke="#527962" fontSize={11} tickLine={false} domain={[40, 90]} unit="%" width={35} />
          <Tooltip content={<CustomChartTooltip unit="%" />} />
          <Area
            type="monotone"
            dataKey="moisture"
            name="Sensor Moisture"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#moistureGrad)"
          />
          <Line
            type="monotone"
            dataKey="optimalMin"
            name="Minimum Optimal"
            stroke="#84cc16"
            strokeDasharray="3 3"
            dot={false}
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="optimalMax"
            name="Maximum Optimal"
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
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#172b20" vertical={false} />
          <XAxis dataKey="time" stroke="#527962" fontSize={11} tickLine={false} />
          <YAxis stroke="#527962" fontSize={11} tickLine={false} domain={[18, 38]} unit="°C" width={34} />
          <Tooltip content={<CustomChartTooltip unit="°C" />} />
          <Line
            type="monotone"
            dataKey="temp"
            name="Ambient Air"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#f59e0b' }}
            activeDot={{ r: 6 }}
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
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#172b20" vertical={false} />
          <XAxis dataKey="month" stroke="#527962" fontSize={11} tickLine={false} />
          <YAxis stroke="#527962" fontSize={11} tickLine={false} unit="mm" width={35} />
          <Tooltip content={<CustomChartTooltip unit="mm" />} />
          <Bar
            dataKey="rainfall"
            name="Measured Precip"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="avgRainfall"
            name="5-Yr Historical Avg"
            fill="#1e3a5f"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 5: Market Price Trend
export const MarketPriceTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#172b20" vertical={false} />
          <XAxis dataKey="month" stroke="#527962" fontSize={11} tickLine={false} />
          <YAxis stroke="#527962" fontSize={11} tickLine={false} domain={['auto', 'auto']} unit="₹" />
          <Tooltip content={<CustomChartTooltip unit="₹/Qtl" />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />
          <Line
            type="monotone"
            dataKey="cotton"
            name="Cotton (₹)"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="rice"
            name="Rice (₹)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="wheat"
            name="Wheat (₹)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="maize"
            name="Maize (₹)"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
