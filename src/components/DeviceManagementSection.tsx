import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Radio,
  Wifi,
  Battery,
  BatteryCharging,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ArrowUpRight,
  Database,
  Layers,
  Thermometer,
  Droplets,
  FlaskConical,
  Gauge,
  Sparkles,
  SignalHigh,
  Play,
  Square,
  Send,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { IIoTDevice, ISoilData } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DeviceManagementProps {
  onSoilDataUpdated?: (newSoil: ISoilData) => void;
  onToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  selectedFarm?: string;
}

export const DeviceManagementSection: React.FC<DeviceManagementProps> = ({
  onSoilDataUpdated,
  onToast,
  selectedFarm = 'Kaveri Delta Smart Agro - Unit 4',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [devices, setDevices] = useState<IIoTDevice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [isCalibratingDevice, setIsCalibratingDevice] = useState<IIoTDevice | null>(null);

  // Live Stream Simulation
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const liveStreamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ping status map: deviceId -> { latency: number, time: string }
  const [pingStatus, setPingStatus] = useState<Record<string, { latency: number; timestamp: string }>>({});
  const [transmittingDeviceId, setTransmittingDeviceId] = useState<string | null>(null);

  // Live Transmission Packet Log
  const [packetLogs, setPacketLogs] = useState<
    Array<{
      id: string;
      deviceId: string;
      sector: string;
      timestamp: string;
      hexPayload: string;
      moisture: number;
      ph: number;
      npk: string;
      status: 'COMMITTED_TO_DB' | 'SYNCHRONIZED';
    }>
  >([]);

  // Simulation Form State
  const [formStep, setFormStep] = useState<'scan' | 'calibrate' | 'confirm'>('scan');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedDevices, setScannedDevices] = useState<
    Array<{
      deviceId: string;
      name: string;
      model: string;
      signal: number;
      protocol: 'LoRaWAN 865MHz' | 'NB-IoT' | 'BLE 5.2 Mesh';
      sector: string;
      depths: string;
    }>
  >([]);

  // Telemetry Sliders
  const [simDeviceId, setSimDeviceId] = useState('AGRI-SOIL-884P');
  const [simName, setSimName] = useState('Sector 4B Sub-surface Probe');
  const [simModel, setSimModel] = useState('AgriSense LoRa Pro-X4');
  const [simProtocol, setSimProtocol] = useState<'LoRaWAN 865MHz' | 'NB-IoT' | 'BLE 5.2 Mesh'>('LoRaWAN 865MHz');
  const [simSector, setSimSector] = useState('Sector 4A - North Plot');
  const [simDepths, setSimDepths] = useState('15cm & 30cm Root Zone');
  const [simMoisture, setSimMoisture] = useState<number>(68);
  const [simPh, setSimPh] = useState<number>(6.8);
  const [simNitrogen, setSimNitrogen] = useState<number>(245);
  const [simPhosphorus, setSimPhosphorus] = useState<number>(38);
  const [simPotassium, setSimPotassium] = useState<number>(310);
  const [simTemp, setSimTemp] = useState<number>(24.2);
  const [simEC, setSimEC] = useState<number>(1.15);
  const [simBattery, setSimBattery] = useState<number>(98);

  const [isSubmittingPair, setIsSubmittingPair] = useState<boolean>(false);

  // Fetch paired devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Cleanup streaming interval
  useEffect(() => {
    return () => {
      if (liveStreamIntervalRef.current) {
        clearInterval(liveStreamIntervalRef.current);
      }
    };
  }, []);

  const notify = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    if (onToast) onToast(msg, type);
  };

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDevices();
      setDevices(data);
      if (data.length > 0 && packetLogs.length === 0) {
        // initialize initial log entries
        setPacketLogs([
          {
            id: 'pkt_init_1',
            deviceId: data[0].deviceId,
            sector: data[0].sector,
            timestamp: new Date().toLocaleTimeString(),
            hexPayload: generateHexPayload(data[0].liveReadings),
            moisture: data[0].liveReadings.moisture,
            ph: data[0].liveReadings.ph,
            npk: `${data[0].liveReadings.nitrogen}:${data[0].liveReadings.phosphorus}:${data[0].liveReadings.potassium}`,
            status: 'COMMITTED_TO_DB',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load devices', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate real LoRaWAN simulated hex payload
  const generateHexPayload = (r: {
    moisture: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    soilTemp?: number;
    electricalConductivity?: number;
  }) => {
    const b1 = Math.round(r.moisture).toString(16).padStart(2, '0').toUpperCase();
    const b2 = Math.round(r.ph * 10).toString(16).padStart(2, '0').toUpperCase();
    const b3 = Math.round(r.nitrogen).toString(16).padStart(2, '0').toUpperCase();
    const b4 = Math.round(r.phosphorus).toString(16).padStart(2, '0').toUpperCase();
    const b5 = Math.round(r.potassium).toString(16).padStart(2, '0').toUpperCase();
    const b6 = Math.round((r.soilTemp ?? 24) * 10).toString(16).padStart(2, '0').toUpperCase();
    const b7 = Math.round((r.electricalConductivity ?? 1.1) * 100).toString(16).padStart(2, '0').toUpperCase();
    return `0x0A ${b1} ${b2} ${b3} ${b4} ${b5} ${b6} ${b7} FF`;
  };

  // Simulate scanning for nearby physical sensors
  const startScanning = () => {
    setIsScanning(true);
    setScannedDevices([]);
    setTimeout(() => {
      const generated = [
        {
          deviceId: `AGRI-SOIL-${Math.floor(800 + Math.random() * 99)}P`,
          name: 'AgriSense 7-in-1 Soil Multi-Depth Node',
          model: 'AgriSense LoRa Pro-X4',
          signal: -58,
          protocol: 'LoRaWAN 865MHz' as const,
          sector: selectedFarm.includes('Delta') ? 'Sector 4A - North Plot' : 'Quadrant B - Wheat Field',
          depths: '15cm, 30cm, 45cm',
        },
        {
          deviceId: `TL-SOIL-${Math.floor(500 + Math.random() * 99)}X`,
          name: 'TerraLink NPK Soil Spectroscopy Array',
          model: 'TerraLink SoilMaster v3',
          signal: -65,
          protocol: 'NB-IoT' as const,
          sector: 'Sector 2B - East Lowland',
          depths: '10cm & 25cm Capacitive',
        },
      ];
      setScannedDevices(generated);
      setIsScanning(false);
    }, 1200);
  };

  const selectScannedDevice = (dev: typeof scannedDevices[0]) => {
    setSimDeviceId(dev.deviceId);
    setSimName(dev.name);
    setSimModel(dev.model);
    setSimProtocol(dev.protocol);
    setSimSector(dev.sector);
    setSimDepths(dev.depths);
    setFormStep('calibrate');
  };

  // Pair device and commit to database
  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingPair(true);
      const payload: Partial<IIoTDevice> = {
        deviceId: simDeviceId,
        name: simName,
        model: simModel,
        type: 'soil_npk_probe',
        protocol: simProtocol,
        batteryLevel: simBattery,
        signalStrength: -62,
        sector: simSector,
        depths: simDepths,
        liveReadings: {
          moisture: simMoisture,
          ph: simPh,
          nitrogen: simNitrogen,
          phosphorus: simPhosphorus,
          potassium: simPotassium,
          soilTemp: simTemp,
          electricalConductivity: simEC,
        },
      };

      const result = await api.pairDevice(payload);
      setDevices(prev => [result.device, ...prev]);

      // Add log
      const newLog = {
        id: `pkt_${Date.now()}`,
        deviceId: result.device.deviceId,
        sector: result.device.sector,
        timestamp: new Date().toLocaleTimeString(),
        hexPayload: generateHexPayload(result.device.liveReadings),
        moisture: result.device.liveReadings.moisture,
        ph: result.device.liveReadings.ph,
        npk: `${result.device.liveReadings.nitrogen}:${result.device.liveReadings.phosphorus}:${result.device.liveReadings.potassium}`,
        status: 'COMMITTED_TO_DB' as const,
      };
      setPacketLogs(prev => [newLog, ...prev.slice(0, 7)]);

      // Propagate soil telemetry to dashboard
      if (onSoilDataUpdated) {
        onSoilDataUpdated(result.updatedSoil);
      }

      notify(`Sensor ${result.device.deviceId} successfully paired! Real-time soil database entries updated.`);
      setIsPairingModalOpen(false);
      setFormStep('scan');
    } catch (err) {
      console.error('Pairing error', err);
      notify('Failed to pair sensor. Check server connection.', 'warning');
    } finally {
      setIsSubmittingPair(false);
    }
  };

  // Send live telemetry transmission packet from existing device
  const handleTransmitTelemetry = async (dev: IIoTDevice, customReadings?: Partial<IIoTDevice['liveReadings']>) => {
    try {
      setTransmittingDeviceId(dev.deviceId);

      // Add a slight realistic fluctuation if not custom
      const readings = customReadings || {
        moisture: Math.min(95, Math.max(20, Math.round(dev.liveReadings.moisture + (Math.random() * 4 - 2)))),
        ph: Number((Math.min(8.5, Math.max(5.5, dev.liveReadings.ph + (Math.random() * 0.2 - 0.1)))).toFixed(1)),
        nitrogen: Math.round(dev.liveReadings.nitrogen + (Math.random() * 6 - 3)),
        phosphorus: Math.round(dev.liveReadings.phosphorus + (Math.random() * 2 - 1)),
        potassium: Math.round(dev.liveReadings.potassium + (Math.random() * 6 - 3)),
        soilTemp: Number((dev.liveReadings.soilTemp + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        electricalConductivity: Number((dev.liveReadings.electricalConductivity + (Math.random() * 0.04 - 0.02)).toFixed(2)),
      };

      const result = await api.sendDeviceTelemetry(dev.deviceId, readings);

      // Update state
      setDevices(prev => prev.map(d => (d.deviceId === dev.deviceId ? result.device : d)));

      // Add log
      const newLog = {
        id: `pkt_${Date.now()}`,
        deviceId: dev.deviceId,
        sector: dev.sector,
        timestamp: new Date().toLocaleTimeString(),
        hexPayload: generateHexPayload(result.device.liveReadings),
        moisture: result.device.liveReadings.moisture,
        ph: result.device.liveReadings.ph,
        npk: `${result.device.liveReadings.nitrogen}:${result.device.liveReadings.phosphorus}:${result.device.liveReadings.potassium}`,
        status: 'COMMITTED_TO_DB' as const,
      };
      setPacketLogs(prev => [newLog, ...prev.slice(0, 7)]);

      if (onSoilDataUpdated) {
        onSoilDataUpdated(result.updatedSoil);
      }

      notify(`Telemetry packet transmitted from ${dev.deviceId} into database!`);
    } catch (err) {
      console.error('Telemetry transmission error', err);
    } finally {
      setTimeout(() => setTransmittingDeviceId(null), 600);
    }
  };

  // Ping probe test
  const handlePingDevice = async (dev: IIoTDevice) => {
    try {
      const res = await api.testDevicePing(dev.deviceId);
      setPingStatus(prev => ({
        ...prev,
        [dev.deviceId]: { latency: res.latencyMs, timestamp: new Date().toLocaleTimeString() },
      }));
      notify(`Ping ACK received from ${dev.deviceId}: ${res.latencyMs}ms (RSSI: ${res.rssi} dBm)`);
    } catch (err) {
      notify(`Ping to ${dev.deviceId} timed out`, 'warning');
    }
  };

  // Unpair device
  const handleUnpairDevice = async (dev: IIoTDevice) => {
    if (!confirm(`Are you sure you want to unpair "${dev.name}" (${dev.deviceId})?`)) return;
    try {
      await api.deleteDevice(dev.deviceId);
      setDevices(prev => prev.filter(d => d.deviceId !== dev.deviceId));
      notify(`Sensor ${dev.deviceId} unpaired successfully.`);
    } catch (err) {
      notify('Failed to unpair sensor', 'warning');
    }
  };

  // Toggle Live Continuous Stream Simulation
  const toggleLiveStream = () => {
    if (isLiveStreaming) {
      if (liveStreamIntervalRef.current) clearInterval(liveStreamIntervalRef.current);
      liveStreamIntervalRef.current = null;
      setIsLiveStreaming(false);
      notify('Continuous IoT telemetry stream stopped.', 'info');
    } else {
      if (devices.length === 0) {
        notify('Please pair at least one IoT sensor first.', 'warning');
        return;
      }
      setIsLiveStreaming(true);
      notify('Continuous physical telemetry simulation activated! Streaming packets every 6s.', 'success');

      liveStreamIntervalRef.current = setInterval(() => {
        setDevices(currentDevices => {
          if (currentDevices.length === 0) return currentDevices;
          // pick a device to transmit
          const targetDev = currentDevices[Math.floor(Math.random() * currentDevices.length)];
          handleTransmitTelemetry(targetDev);
          return currentDevices;
        });
      }, 6000);
    }
  };

  // Calculate stats
  const activeCount = devices.filter(d => d.status === 'online').length;
  const avgMoisture =
    devices.length > 0
      ? Math.round(devices.reduce((acc, d) => acc + d.liveReadings.moisture, 0) / devices.length)
      : 68;
  const avgPh =
    devices.length > 0
      ? (devices.reduce((acc, d) => acc + d.liveReadings.ph, 0) / devices.length).toFixed(1)
      : '6.8';

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & QUICK TELEMETRY BAR */}
      <div
        className={`p-6 rounded-2xl border shadow-xl transition-all duration-200 ${
          isDark
            ? 'bg-[#0c1711] border-emerald-800/40 text-white'
            : 'bg-white border-emerald-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-emerald-950/40 dark:border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-['Outfit'] tracking-tight flex items-center gap-2">
                  IoT Soil Sensors & Hardware Mesh
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Telemetry
                  </span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Pair in-field physical multi-depth soil probes via simulated LoRaWAN/NB-IoT beacons to populate real-time database entries.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Streaming Simulation Switch */}
            <button
              onClick={toggleLiveStream}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                isLiveStreaming
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : isDark
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Stop Stream ({6}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Auto-Stream Simulation</span>
                </>
              )}
            </button>

            {/* Refresh from Database */}
            <button
              onClick={fetchDevices}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#08100c] border-emerald-900 text-zinc-300 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Refresh Devices from DB"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Open Pairing Studio Button */}
            <button
              onClick={() => {
                setIsPairingModalOpen(true);
                setFormStep('scan');
                startScanning();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Pair Physical Sensor</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#08100c]/80 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Active Probes</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">{activeCount}</span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>/ {devices.length} Online</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#08100c]/80 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Mean Moisture</span>
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-sky-400">{avgMoisture}%</span>
              <span className="text-[10px] text-emerald-400 font-medium">Field Opt.</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#08100c]/80 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Soil pH Index</span>
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-400">{avgPh}</span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Neutral</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#08100c]/80 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>DB Persistence</span>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Live Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAIRED SENSORS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className={`text-sm font-bold font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Paired Physical Probes ({devices.length})
          </h3>
          <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Mesh Gateway: {selectedFarm}
          </span>
        </div>

        {devices.length === 0 && !isLoading && (
          <div
            className={`p-10 text-center rounded-2xl border ${
              isDark ? 'bg-[#0a140f] border-emerald-900/40 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <Radio className="w-10 h-10 mx-auto mb-3 text-emerald-500/50" />
            <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              No Physical IoT Sensors Paired
            </h4>
            <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
              Use the physical sensor simulation studio to discover and pair in-ground LoRaWAN or NB-IoT probes.
            </p>
            <button
              onClick={() => {
                setIsPairingModalOpen(true);
                setFormStep('scan');
                startScanning();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Pair First IoT Sensor</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map(device => {
            const isTransmitting = transmittingDeviceId === device.deviceId;
            const ping = pingStatus[device.deviceId];

            return (
              <div
                key={device._id || device.deviceId}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isTransmitting
                    ? 'ring-2 ring-emerald-400 shadow-emerald-500/20'
                    : ''
                } ${
                  isDark
                    ? 'bg-[#0a1510] border-emerald-900/50 hover:border-emerald-700/60 shadow-lg text-white'
                    : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-sm text-slate-900'
                }`}
              >
                {/* Visual pulse banner when transmitting */}
                {isTransmitting && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
                )}

                {/* Top device header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-['Outfit']">{device.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {device.deviceId}
                        </span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {device.model} • {device.sector}
                      </p>
                    </div>
                  </div>

                  {/* Status & Battery */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {device.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-0.5">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        {device.batteryLevel}%
                      </span>
                      <span className="flex items-center gap-0.5">
                        <SignalHigh className="w-3 h-3 text-emerald-400" />
                        {device.signalStrength}dBm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Sensor Metrics Grid */}
                <div
                  className={`p-3 rounded-xl border mb-3 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs ${
                    isDark ? 'bg-[#060e0a] border-emerald-950/80' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Moisture
                    </span>
                    <span className="font-bold font-mono text-sky-400 text-sm">
                      {device.liveReadings.moisture}%
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      pH Level
                    </span>
                    <span className="font-bold font-mono text-amber-400 text-sm">
                      {device.liveReadings.ph}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      NPK (kg/ha)
                    </span>
                    <span className="font-bold font-mono text-emerald-400 text-[11px]">
                      {device.liveReadings.nitrogen}:{device.liveReadings.phosphorus}:{device.liveReadings.potassium}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Soil Temp
                    </span>
                    <span className="font-bold font-mono text-rose-400 text-sm">
                      {device.liveReadings.soilTemp}°C
                    </span>
                  </div>
                </div>

                {/* Hardware metadata line */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-3 border-b border-emerald-950/50 mb-3">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-500" />
                    Depths: {device.depths}
                  </span>
                  <span>MAC: {device.macAddress}</span>
                </div>

                {/* Ping readout if tested */}
                {ping && (
                  <div className="mb-3 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                    <span>Wireless Ping: {ping.latency}ms (Round-Trip)</span>
                    <span className="text-zinc-500 text-[10px]">{ping.timestamp}</span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Transmit Live Packet */}
                    <button
                      onClick={() => handleTransmitTelemetry(device)}
                      disabled={isTransmitting}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      title="Transmit live sensor reading into database"
                    >
                      <Send className={`w-3 h-3 ${isTransmitting ? 'animate-bounce' : ''}`} />
                      <span>{isTransmitting ? 'Transmitting...' : 'Transmit Packet'}</span>
                    </button>

                    {/* Test Ping */}
                    <button
                      onClick={() => handlePingDevice(device)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                        isDark
                          ? 'bg-emerald-950/40 border-emerald-900 text-zinc-300 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Ping
                    </button>

                    {/* Calibrate / Adjust Telemetry */}
                    <button
                      onClick={() => setIsCalibratingDevice(device)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                        isDark
                          ? 'bg-emerald-950/40 border-emerald-900 text-zinc-300 hover:text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                      title="Calibrate simulated sensor values"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Unpair */}
                  <button
                    onClick={() => handleUnpairDevice(device)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Unpair probe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REAL-TIME DATABASE TELEMETRY WRITE LOG */}
      <div
        className={`p-5 rounded-2xl border shadow-md ${
          isDark ? 'bg-[#0a1510] border-emerald-900/40 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-950/50 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
              Live Sensor Database Transactions (LoRaWAN Gateway Feed)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active Sync
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          {packetLogs.length === 0 ? (
            <p className="text-zinc-500 text-xs py-2">Waiting for first telemetry transmission...</p>
          ) : (
            packetLogs.map(log => (
              <div
                key={log.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg border gap-2 ${
                  isDark
                    ? 'bg-[#060e0a] border-emerald-950/60 text-zinc-300'
                    : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    {log.deviceId}
                  </span>
                  <span className="text-zinc-400 text-[10px]">{log.sector}</span>
                  <span className="text-sky-400">Moist:{log.moisture}%</span>
                  <span className="text-amber-400">pH:{log.ph}</span>
                  <span className="text-emerald-400">NPK:[{log.npk}]</span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-zinc-500">{log.hexPayload}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 text-[9px] font-bold">
                    DB_OK
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: PHYSICAL IOT SENSOR PAIRING SIMULATION STUDIO */}
      {isPairingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#0b1812] border-emerald-700/60 text-white' : 'bg-white border-emerald-300 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit']">Physical IoT Sensor Pairing Studio</h3>
                  <p className="text-[11px] text-zinc-400">
                    Discover probe beacons & calibrate telemetry to populate database entries.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPairingModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormStep('scan')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  formStep === 'scan'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-[#07110c] text-zinc-400 border-emerald-950'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                1. Sensor Beacon Discovery
              </button>
              <button
                type="button"
                onClick={() => setFormStep('calibrate')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  formStep === 'calibrate'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-[#07110c] text-zinc-400 border-emerald-950'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                2. Live Telemetry Calibrator
              </button>
            </div>

            {/* STEP 1: SCAN & DISCOVERY */}
            {formStep === 'scan' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#060e0a] border-emerald-950' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Radio className={`w-5 h-5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">LoRaWAN 865MHz & BLE Sensor Gateway</p>
                      <p className="text-[11px] text-zinc-400">
                        {isScanning
                          ? 'Listening for broadcast telemetry chirp frames...'
                          : 'Gateway active. Click scan to discover physical soil probes in range.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startScanning}
                    disabled={isScanning}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Rescan Range'}</span>
                  </button>
                </div>

                {/* Scanned Results */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Available Discovered Beacons ({scannedDevices.length})
                  </span>

                  {scannedDevices.map(scanned => (
                    <div
                      key={scanned.deviceId}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isDark
                          ? 'bg-[#09140e] border-emerald-900/60 hover:border-emerald-500'
                          : 'bg-white border-slate-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{scanned.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {scanned.deviceId}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {scanned.model} • {scanned.protocol} • {scanned.depths}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-emerald-400">{scanned.signal} dBm</span>
                        <button
                          type="button"
                          onClick={() => selectScannedDevice(scanned)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Select & Configure →
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Manual entry option */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setFormStep('calibrate')}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      Or enter custom hardware parameters manually →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TELEMETRY CALIBRATOR (SIMULATION FORM) */}
            {formStep === 'calibrate' && (
              <form onSubmit={handlePairSubmit} className="space-y-4 text-xs">
                {/* Hardware Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Device Hardware ID</label>
                    <input
                      type="text"
                      required
                      value={simDeviceId}
                      onChange={e => setSimDeviceId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Probe Nickname</label>
                    <input
                      type="text"
                      required
                      value={simName}
                      onChange={e => setSimName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Farm Plot / Sector</label>
                    <input
                      type="text"
                      required
                      value={simSector}
                      onChange={e => setSimSector(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Hardware Model</label>
                    <select
                      value={simModel}
                      onChange={e => setSimModel(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 focus:outline-none"
                    >
                      <option>AgriSense LoRa Pro-X4</option>
                      <option>TerraLink SoilMaster v3</option>
                      <option>Precision Agro Multilevel NPK Probe</option>
                      <option>SenseCAP Wireless LoRaWAN Sensor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Telemetry Protocol</label>
                    <select
                      value={simProtocol}
                      onChange={e => setSimProtocol(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 focus:outline-none"
                    >
                      <option>LoRaWAN 865MHz</option>
                      <option>NB-IoT</option>
                      <option>BLE 5.2 Mesh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Probe Depth Level</label>
                    <input
                      type="text"
                      value={simDepths}
                      onChange={e => setSimDepths(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07110c] border border-emerald-800 text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* PHYSICAL SIMULATION SLIDERS */}
                <div className="p-4 rounded-xl border border-emerald-900/80 bg-[#060e0a] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Physical Telemetry Simulation Calibrator
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Real-time database destination: /api/soil/update
                    </span>
                  </div>

                  {/* Soil Moisture Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 font-medium">Volumetric Soil Moisture</span>
                      <span className="font-mono font-bold text-sky-400 text-sm">{simMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      value={simMoisture}
                      onChange={e => setSimMoisture(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>Dry Deficit (10%)</span>
                      <span className="text-emerald-400 font-medium">Optimal Root Zone (55-75%)</span>
                      <span>Saturated (95%)</span>
                    </div>
                  </div>

                  {/* Soil pH Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 font-medium">Soil pH Level</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{simPh}</span>
                    </div>
                    <input
                      type="range"
                      min={4.5}
                      max={9.0}
                      step={0.1}
                      value={simPh}
                      onChange={e => setSimPh(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>Acidic (4.5)</span>
                      <span className="text-emerald-400 font-medium">Neutral / Optimal (6.5 - 7.2)</span>
                      <span>Alkaline (9.0)</span>
                    </div>
                  </div>

                  {/* N-P-K Controls */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Nitrogen (N kg/ha)</label>
                      <input
                        type="number"
                        value={simNitrogen}
                        onChange={e => setSimNitrogen(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900 text-emerald-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Phosphorus (P kg/ha)</label>
                      <input
                        type="number"
                        value={simPhosphorus}
                        onChange={e => setSimPhosphorus(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900 text-amber-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Potassium (K kg/ha)</label>
                      <input
                        type="number"
                        value={simPotassium}
                        onChange={e => setSimPotassium(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900 text-teal-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Temp & EC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Soil Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={simTemp}
                        onChange={e => setSimTemp(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900 text-rose-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 text-[11px]">Electrical Conductivity (dS/m)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={simEC}
                        onChange={e => setSimEC(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900 text-purple-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* LoRaWAN HEX PACKET ENCODING PREVIEW */}
                  <div className="p-2.5 rounded-lg bg-[#030805] border border-emerald-950 font-mono text-[10px] space-y-1">
                    <span className="text-zinc-500 block">Simulated Wireless Hex Frame Payload:</span>
                    <span className="text-emerald-400 font-bold block">
                      {generateHexPayload({
                        moisture: simMoisture,
                        ph: simPh,
                        nitrogen: simNitrogen,
                        phosphorus: simPhosphorus,
                        potassium: simPotassium,
                        soilTemp: simTemp,
                        electricalConductivity: simEC,
                      })}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setFormStep('scan')}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    ← Back to Discovery
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPair}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingPair ? 'Pairing & Syncing...' : 'Pair Sensor & Populate Real-Time DB'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK CALIBRATION & RE-TRANSMIT MODAL FOR EXISTING DEVICE */}
      {isCalibratingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 text-xs ${
              isDark ? 'bg-[#0b1812] border-emerald-700/60 text-white' : 'bg-white border-emerald-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <div>
                <h3 className="text-base font-bold font-['Outfit']">Calibrate Sensor Telemetry</h3>
                <p className="text-[11px] text-zinc-400">
                  {isCalibratingDevice.name} ({isCalibratingDevice.deviceId})
                </p>
              </div>
              <button onClick={() => setIsCalibratingDevice(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Soil Moisture: {isCalibratingDevice.liveReadings.moisture}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={95}
                  value={isCalibratingDevice.liveReadings.moisture}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setIsCalibratingDevice({
                      ...isCalibratingDevice,
                      liveReadings: { ...isCalibratingDevice.liveReadings, moisture: val },
                    });
                  }}
                  className="w-full accent-sky-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Soil pH: {isCalibratingDevice.liveReadings.ph}
                </label>
                <input
                  type="range"
                  min={4.5}
                  max={9.0}
                  step={0.1}
                  value={isCalibratingDevice.liveReadings.ph}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setIsCalibratingDevice({
                      ...isCalibratingDevice,
                      liveReadings: { ...isCalibratingDevice.liveReadings, ph: val },
                    });
                  }}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">N (kg/ha)</label>
                  <input
                    type="number"
                    value={isCalibratingDevice.liveReadings.nitrogen}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setIsCalibratingDevice({
                        ...isCalibratingDevice,
                        liveReadings: { ...isCalibratingDevice.liveReadings, nitrogen: val },
                      });
                    }}
                    className="w-full p-1.5 rounded bg-[#07110c] border border-emerald-900 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">P (kg/ha)</label>
                  <input
                    type="number"
                    value={isCalibratingDevice.liveReadings.phosphorus}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setIsCalibratingDevice({
                        ...isCalibratingDevice,
                        liveReadings: { ...isCalibratingDevice.liveReadings, phosphorus: val },
                      });
                    }}
                    className="w-full p-1.5 rounded bg-[#07110c] border border-emerald-900 text-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">K (kg/ha)</label>
                  <input
                    type="number"
                    value={isCalibratingDevice.liveReadings.potassium}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setIsCalibratingDevice({
                        ...isCalibratingDevice,
                        liveReadings: { ...isCalibratingDevice.liveReadings, potassium: val },
                      });
                    }}
                    className="w-full p-1.5 rounded bg-[#07110c] border border-emerald-900 text-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCalibratingDevice(null)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleTransmitTelemetry(isCalibratingDevice, isCalibratingDevice.liveReadings);
                    setIsCalibratingDevice(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Push to Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
