/**
 * ProfessionalDashboard — FIXED
 *
 * Was: using SensorSimulator (frontend fake data) + DEFAULT_BUILDING_CONFIG (hardcoded rooms)
 * Now: real rooms from /api/rooms, real live sensor data via Socket.IO (useSocket hook),
 *      real active alerts from /api/alerts/active, real AI logs from socket aiReasoning events.
 *
 * The scenarioManager still works — it injects overrides on top of real socket data.
 * The chart still accumulates datapoints every time a sensorUpdate fires, same visual effect.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Zap, Cloud, Users, AlertTriangle, TrendingUp,
  Activity, Thermometer, Info, Eye, EyeOff, Brain,
  Wifi, WifiOff, Loader,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { THEME_COLORS } from '../config/theme';
import { roomsAPI, alertsAPI } from '../services/api';
import useSocket from '../hooks/useSocket';
import { scenarioManager } from '../services/scenarioManager';
import HealthScoreGauge from '../components/HealthScoreGauge';

// ── Simple local health score (replaces AIAnalyticsEngine) ───────────────────
function calcHealthScore(sensor) {
  if (!sensor) return 0;
  let score = 100;
  const temp = sensor.temperature ?? sensor.sensors?.temperature;
  const aqi  = sensor.airQuality  ?? sensor.sensors?.aqi;
  const energy = sensor.energyUsage ?? sensor.sensors?.power;

  if (temp !== undefined) {
    if (temp > 35) score -= 40;
    else if (temp > 30) score -= 20;
    else if (temp < 18) score -= 10;
  }
  if (aqi !== undefined) {
    if (aqi > 200) score -= 35;
    else if (aqi > 100) score -= 15;
  }
  if (energy !== undefined) {
    if (energy > 700) score -= 15;
    else if (energy > 500) score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

// ── Classify alert severity from sensor (replaces aiEngine.classifyAlert) ───
function classifyAlerts(sensor, roomName) {
  const alerts = [];
  const temp = sensor.temperature;
  const aqi  = sensor.airQuality;
  const energy = sensor.energyUsage;

  if (temp > 35)       alerts.push({ severity: 'CRITICAL', message: `Critical temp ${temp}°C`, room: roomName });
  else if (temp > 30)  alerts.push({ severity: 'HIGH',     message: `High temp ${temp}°C`,     room: roomName });
  if (aqi > 200)       alerts.push({ severity: 'CRITICAL', message: `Hazardous AQI ${aqi}`,    room: roomName });
  else if (aqi > 100)  alerts.push({ severity: 'HIGH',     message: `Poor AQI ${aqi}`,         room: roomName });
  if (energy > 700)    alerts.push({ severity: 'HIGH',     message: `High energy ${energy}W`,  room: roomName });

  return alerts;
}

export default function ProfessionalDashboard() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // ── State ──────────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);           // from /api/rooms
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);  // from /api/alerts/active
  const [localAlerts, setLocalAlerts] = useState([]);    // derived from socket sensor data
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showAIReasoning, setShowAIReasoning] = useState(false);
  const [chartData, setChartData] = useState([]);

  // ── Socket hook — real-time sensor data ───────────────────────────────────
  const { sensorData, newAlerts, latestAiLog, isConnected } = useSocket();

  // ── Fetch rooms and active alerts on mount ────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setRoomsLoading(true);
        const [roomsRes, alertsRes] = await Promise.all([
          roomsAPI.getAll(1, 100),
          alertsAPI.getActive(1, 20),
        ]);
        setRooms(roomsRes.data || roomsRes.rooms || []);
        setActiveAlerts(alertsRes.data || alertsRes.alerts || []);
      } catch (err) {
        console.error('[Dashboard] Load error:', err.message);
      } finally {
        setRoomsLoading(false);
      }
    }
    load();
  }, []);

  // ── Merge new socket alerts into activeAlerts ─────────────────────────────
  useEffect(() => {
    if (newAlerts.length > 0) {
      setActiveAlerts(prev => {
        const ids = new Set(prev.map(a => a._id));
        const fresh = newAlerts.filter(a => !ids.has(a._id));
        return [...fresh, ...prev].slice(0, 20);
      });
    }
  }, [newAlerts]);

  // ── Derive local alerts from live sensor data ─────────────────────────────
  useEffect(() => {
    const derived = [];
    Object.entries(sensorData).forEach(([roomName, sensor]) => {
      // Apply scenario overrides if any active
      const effective = scenarioManager.applyScenarioEffects({ ...sensor }, roomName);
      derived.push(...classifyAlerts(effective, roomName));
    });
    setLocalAlerts(derived.slice(0, 10));
  }, [sensorData]);

  // ── Build chart datapoints from socket updates ────────────────────────────
  useEffect(() => {
    if (Object.keys(sensorData).length === 0) return;

    const allSensors = Object.values(sensorData);
    const avgTemp = (allSensors.reduce((s, d) => s + (d.temperature || 0), 0) / allSensors.length).toFixed(1);
    const avgAQI  = (allSensors.reduce((s, d) => s + (d.airQuality || 0), 0) / allSensors.length).toFixed(0);
    const totalEnergy = allSensors.reduce((s, d) => s + (d.energyUsage || 0), 0);
    const occupiedRooms = allSensors.filter(d => d.motion).length;

    setChartData(prev => [
      ...prev.slice(-11),
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        occupancy: occupiedRooms,
        temperature: parseFloat(avgTemp),
        power: Math.round(totalEnergy),
        aqi: parseInt(avgAQI),
      },
    ]);
  }, [sensorData]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const allSensors = Object.values(sensorData);
  const avgTemp    = allSensors.length
    ? (allSensors.reduce((s, d) => s + (d.temperature || 0), 0) / allSensors.length).toFixed(1)
    : '—';
  const avgAQI     = allSensors.length
    ? (allSensors.reduce((s, d) => s + (d.airQuality || 0), 0) / allSensors.length).toFixed(0)
    : '—';
  const totalPowerKW = allSensors.length
    ? (allSensors.reduce((s, d) => s + (d.energyUsage || 0), 0) / 1000).toFixed(1)
    : '—';
  const occupiedRooms = allSensors.filter(d => d.motion).length;

  const allAlerts = [...activeAlerts, ...localAlerts];

  // AI reasoning lines from latest socket event
  const aiLines = latestAiLog
    ? [
        `📍 Room: ${latestAiLog.room}`,
        `🧠 ${latestAiLog.analysis?.reasoning || latestAiLog.reasoning || ''}`,
        `⚡ Action: ${latestAiLog.analysis?.actionTaken || latestAiLog.actionTaken || ''}`,
        `🔖 Severity: ${latestAiLog.analysis?.severity || latestAiLog.severity || ''}`,
      ]
    : [];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.bg.primary, color: colors.text.primary }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b p-6"
        style={{ borderColor: colors.border.primary }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Campus Monitor</h1>
              <p style={{ color: colors.text.secondary }} className="text-sm mt-1">
                Real-time Intelligent Monitoring System
              </p>
            </div>

            {/* Live connection badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
              isDark
                ? isConnected ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300' : 'bg-red-900/30 border-red-700 text-red-300'
                : isConnected ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              {isConnected
                ? <><Wifi className="w-4 h-4" /><motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>Live</motion.span></>
                : <><WifiOff className="w-4 h-4" /> Reconnecting...</>
              }
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl p-6 space-y-6">

        {/* Hero Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: Users,       label: 'Occupied Rooms', value: occupiedRooms, unit: `of ${rooms.length}` },
            { icon: Thermometer, label: 'Avg Temperature', value: avgTemp,       unit: '°C' },
            { icon: Cloud,       label: 'Avg Air Quality', value: avgAQI,        unit: 'AQI' },
            { icon: Zap,         label: 'Total Power',     value: totalPowerKW,  unit: 'kW' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-6 rounded-xl border transition-all hover:shadow-lg"
              style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: colors.text.secondary }} className="text-sm font-medium">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold">{metric.value}</p>
                  <p style={{ color: colors.text.tertiary }} className="text-xs mt-1">{metric.unit}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.bg.secondary }}>
                  <metric.icon className="w-6 h-6" style={{ color: '#3B82F6' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Temperature trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5" /> Temperature Trend
            </h3>
            {chartData.length === 0
              ? <div className="h-[300px] flex items-center justify-center text-sm" style={{ color: colors.text.secondary }}>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Waiting for live data...
                </div>
              : <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
                    <XAxis dataKey="time" stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <YAxis stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.primary}` }} />
                    <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
            }
          </motion.div>

          {/* AQI trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5" /> Air Quality Trend
            </h3>
            {chartData.length === 0
              ? <div className="h-[300px] flex items-center justify-center text-sm" style={{ color: colors.text.secondary }}>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Waiting for live data...
                </div>
              : <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
                    <XAxis dataKey="time" stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <YAxis stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.primary}` }} />
                    <Area type="monotone" dataKey="aqi" stroke="#10B981" fill="url(#aqiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </motion.div>

          {/* Power trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Power Consumption
            </h3>
            {chartData.length === 0
              ? <div className="h-[300px] flex items-center justify-center text-sm" style={{ color: colors.text.secondary }}>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Waiting for live data...
                </div>
              : <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
                    <XAxis dataKey="time" stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <YAxis stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.primary}` }} />
                    <Bar dataKey="power" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </motion.div>

          {/* Occupancy trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Occupied Rooms
            </h3>
            {chartData.length === 0
              ? <div className="h-[300px] flex items-center justify-center text-sm" style={{ color: colors.text.secondary }}>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Waiting for live data...
                </div>
              : <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
                    <XAxis dataKey="time" stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <YAxis stroke={colors.text.secondary} style={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.bg.secondary, border: `1px solid ${colors.border.primary}` }} />
                    <Area type="monotone" dataKey="occupancy" stroke="#3B82F6" fill="url(#occGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </motion.div>
        </div>

        {/* Live Room Grid + AI Insights */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Room Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" /> Live Room Monitoring
            </h2>

            {roomsLoading ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
                <Loader className="w-4 h-4 animate-spin" /> Loading rooms...
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-sm" style={{ color: colors.text.secondary }}>No rooms found.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {rooms.map((room) => {
                  // Get live sensor data for this room from socket
                  let sensor = sensorData[room.name] || null;

                  // Apply scenario overrides if active
                  if (sensor) {
                    sensor = scenarioManager.applyScenarioEffects({ ...sensor }, room.name);
                  }

                  const health = calcHealthScore(sensor);
                  const isExpanded = expandedRoom === room._id;
                  const hasData = !!sensor;

                  const borderColor = health > 80 ? '#10B981' : health > 50 ? '#F59E0B' : '#EF4444';

                  return (
                    <motion.div
                      key={room._id}
                      layoutId={room._id}
                      onClick={() => setExpandedRoom(isExpanded ? null : room._id)}
                      className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
                      style={{ backgroundColor: colors.card, borderColor: hasData ? borderColor : colors.border.primary }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{room.name}</h4>
                          <p style={{ color: colors.text.secondary }} className="text-xs capitalize">{room.type}</p>
                        </div>
                        <div className="text-right">
                          {hasData
                            ? <><div className="text-2xl font-bold">{health}</div>
                                <p style={{ color: colors.text.secondary }} className="text-xs">Health</p></>
                            : <Loader className="w-5 h-5 animate-spin text-gray-400" />
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p style={{ color: colors.text.secondary }} className="text-xs">Motion</p>
                          <p className="font-semibold">{hasData ? (sensor.motion ? 'Yes' : 'No') : '—'}</p>
                        </div>
                        <div>
                          <p style={{ color: colors.text.secondary }} className="text-xs">Temp</p>
                          <p className="font-semibold">{hasData ? `${sensor.temperature}°C` : '—'}</p>
                        </div>
                        <div>
                          <p style={{ color: colors.text.secondary }} className="text-xs">AQI</p>
                          <p className="font-semibold">{hasData ? sensor.airQuality : '—'}</p>
                        </div>
                        <div>
                          <p style={{ color: colors.text.secondary }} className="text-xs">Energy</p>
                          <p className="font-semibold">{hasData ? `${sensor.energyUsage}W` : '—'}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && hasData && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t"
                            style={{ borderColor: colors.border.primary }}
                          >
                            <div className="flex justify-center py-2">
                              <HealthScoreGauge score={health} size={140} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                              <div>
                                <p style={{ color: colors.text.secondary }} className="text-xs">Floor</p>
                                <p>{room.floor || '—'}</p>
                              </div>
                              <div>
                                <p style={{ color: colors.text.secondary }} className="text-xs">Capacity</p>
                                <p>{room.capacity || '—'}</p>
                              </div>
                              <div>
                                <p style={{ color: colors.text.secondary }} className="text-xs">Normal Temp</p>
                                <p>{room.normalTemperature || '—'}°C</p>
                              </div>
                              <div>
                                <p style={{ color: colors.text.secondary }} className="text-xs">Status</p>
                                <p className="capitalize">{room.status || 'active'}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border flex flex-col"
            style={{ backgroundColor: colors.card, borderColor: colors.border.primary }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" /> AI Insights
              </h3>
              <motion.button
                onClick={() => setShowAIReasoning(!showAIReasoning)}
                whileHover={{ scale: 1.1 }}
              >
                {showAIReasoning ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {showAIReasoning ? (
                aiLines.length > 0 ? (
                  <div
                    className="p-3 rounded-lg text-xs font-mono space-y-1.5"
                    style={{ backgroundColor: colors.bg.secondary }}
                  >
                    {aiLines.map((line, idx) => (
                      <div key={idx}>
                        {line.startsWith('⚠️') || line.startsWith('🔖') ? (
                          <span style={{ color: '#FBBF24' }}>{line}</span>
                        ) : line.startsWith('✅') ? (
                          <span style={{ color: '#10B981' }}>{line}</span>
                        ) : (
                          <span style={{ color: colors.text.secondary }}>{line}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-lg text-sm text-center"
                    style={{ backgroundColor: colors.bg.secondary, color: colors.text.secondary }}
                  >
                    No AI analysis yet. Go to the AI Analysis page and run diagnostics on a room.
                  </div>
                )
              ) : (
                <div style={{ color: colors.text.secondary }} className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                    <div>
                      <p className="font-semibold">Active Alerts</p>
                      <p>{allAlerts.length} alerts</p>
                    </div>
                  </div>
                  <div className="border-t pt-2" style={{ borderColor: colors.border.primary }}>
                    {allAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="py-2 border-b last:border-0" style={{ borderColor: colors.border.primary }}>
                        <p className={`font-semibold text-xs uppercase ${
                          alert.severity === 'CRITICAL' ? 'text-red-500' :
                          alert.severity === 'HIGH' ? 'text-orange-500' :
                          alert.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                        }`}>{alert.severity}</p>
                        <p className="text-xs mt-0.5">{alert.message}</p>
                        {alert.room && <p className="text-xs opacity-60">{alert.room}</p>}
                      </div>
                    ))}
                    {allAlerts.length === 0 && (
                      <p className="text-xs py-2 opacity-60">✨ No active alerts</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
