import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Zap,
  Cloud,
  Droplets,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  Wind,
  Thermometer,
  Heart,
  MapPin,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { THEME_COLORS } from '../config/theme';
import { SensorSimulator, DEFAULT_BUILDING_CONFIG } from '../services/simulationEngine';
import { AIAnalyticsEngine } from '../services/aiAnalytics';
import { scenarioManager } from '../services/scenarioManager';
import HealthScoreGauge from '../components/HealthScoreGauge';

export default function ProfessionalDashboard() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [sensorData, setSensorData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [showAIReasoning, setShowAIReasoning] = useState(false);
  const [aiReasoning, setAiReasoning] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('block-a');
  const [recommendations, setRecommendations] = useState([]);

  const aiEngine = new AIAnalyticsEngine();

  // Initialize simulators
  useEffect(() => {
    const simulators = {};
    DEFAULT_BUILDING_CONFIG.buildings.forEach((building) => {
      simulators[building.id] = {};
      building.rooms.forEach((room) => {
        simulators[building.id][room.id] = new SensorSimulator(room.id, room.type);
      });
    });

    // Update sensors every 5 seconds
    const interval = setInterval(() => {
      const newData = {};
      const newAlerts = [];

      DEFAULT_BUILDING_CONFIG.buildings.forEach((building) => {
        newData[building.id] = {};
        building.rooms.forEach((room) => {
          let data = simulators[building.id][room.id].generateSensorData();
          
          // Apply scenario effects if any active
          data = scenarioManager.applyScenarioEffects(data, room.id);
          
          newData[building.id][room.id] = data;

          // Analyze alerts
          const roomAlerts = aiEngine.classifyAlert(data);
          newAlerts.push(...roomAlerts.map((a) => ({ ...a, roomId: room.id, room: room.name })));

          // AI reasoning for first room
          if (building.id === 'block-a' && room.id === 'a-101') {
            const reasoning = aiEngine.generateReasoning(room.id, data, roomAlerts);
            setAiReasoning(reasoning);

            const recs = aiEngine.generateRecommendation(data, roomAlerts);
            setRecommendations(recs);
          }
        });
      });

      setSensorData(newData);
      setAlerts(newAlerts.slice(0, 10)); // Keep only latest 10

      // Update chart data
      setChartData((prev) => {
        const newChart = [
          ...prev.slice(-11),
          {
            time: new Date().toLocaleTimeString(),
            occupancy: Object.values(newData)
              .flatMap((b) => Object.values(b))
              .reduce((sum, d) => sum + d.sensors.occupancy, 0),
            temperature: (Object.values(newData)
              .flatMap((b) => Object.values(b))
              .reduce((sum, d) => sum + d.sensors.temperature, 0) /
              (Object.values(newData).flatMap((b) => Object.values(b)).length || 1)).toFixed(1),
            power: Object.values(newData)
              .flatMap((b) => Object.values(b))
              .reduce((sum, d) => sum + d.sensors.power, 0),
            aqi: (Object.values(newData)
              .flatMap((b) => Object.values(b))
              .reduce((sum, d) => sum + d.sensors.aqi, 0) /
              (Object.values(newData).flatMap((b) => Object.values(b)).length || 1)).toFixed(0),
          },
        ];
        return newChart;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentBuildingData = sensorData[selectedBuilding] || {};
  const rooms = DEFAULT_BUILDING_CONFIG.buildings.find(
    (b) => b.id === selectedBuilding
  )?.rooms || [];

  // Calculate metrics
  const totalOccupancy = Object.values(currentBuildingData)
    .reduce((sum, d) => sum + (d?.sensors?.occupancy || 0), 0);
  const avgTemp = (Object.values(currentBuildingData)
    .reduce((sum, d) => sum + (d?.sensors?.temperature || 0), 0) /
    Math.max(Object.values(currentBuildingData).length, 1)).toFixed(1);
  const avgAQI = (Object.values(currentBuildingData)
    .reduce((sum, d) => sum + (d?.sensors?.aqi || 0), 0) /
    Math.max(Object.values(currentBuildingData).length, 1)).toFixed(0);
  const totalPower = Object.values(currentBuildingData)
    .reduce((sum, d) => sum + (d?.sensors?.power || 0), 0);

  const healthScore = currentBuildingData[rooms[0]?.id]
    ? aiEngine.calculateHealthScore(currentBuildingData[rooms[0]?.id])
    : 0;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
      }}
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
              <p style={{ color: colors.text.secondary }} className="text-sm">
                Real-time Intelligent Monitoring System
              </p>
            </div>

            {/* Building Selector */}
            <div className="flex gap-2">
              {DEFAULT_BUILDING_CONFIG.buildings.map((building) => (
                <motion.button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor:
                      selectedBuilding === building.id
                        ? '#3B82F6'
                        : colors.bg.secondary,
                    color:
                      selectedBuilding === building.id
                        ? '#FFFFFF'
                        : colors.text.primary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                >
                  {building.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Hero Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: Users, label: 'Occupancy', value: totalOccupancy, unit: 'people' },
            {
              icon: Thermometer,
              label: 'Avg Temp',
              value: avgTemp,
              unit: '°C',
            },
            { icon: Cloud, label: 'Air Quality', value: avgAQI, unit: 'AQI' },
            { icon: Zap, label: 'Power Usage', value: (totalPower / 1000).toFixed(1), unit: 'kW' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl border transition-all hover:shadow-lg"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border.primary,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: colors.text.secondary }} className="text-sm font-medium">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold">{metric.value}</p>
                  <p style={{ color: colors.text.tertiary }} className="text-xs mt-1">
                    {metric.unit}
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: colors.bg.secondary }}
                >
                  <metric.icon className="w-6 h-6" style={{ color: '#3B82F6' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line Chart - Trends */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Occupancy Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border.primary}
                />
                <XAxis
                  dataKey="time"
                  stroke={colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke={colors.text.secondary} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorOccupancy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Temperature Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Temperature Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border.primary}
                />
                <XAxis
                  dataKey="time"
                  stroke={colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke={colors.text.secondary} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Power & AQI */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Power Consumption */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Power Consumption
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border.primary}
                />
                <XAxis
                  dataKey="time"
                  stroke={colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke={colors.text.secondary} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                />
                <Bar dataKey="power" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Air Quality */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Air Quality Index
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border.primary}
                />
                <XAxis
                  dataKey="time"
                  stroke={colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke={colors.text.secondary} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Live Sensor Grid & AI Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sensor Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Live Room Monitoring
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              {rooms.map((room) => {
                const roomData = currentBuildingData[room.id];
                if (!roomData) return null;

                const { sensors } = roomData;
                const health = aiEngine.calculateHealthScore(roomData);
                const isExpanded = expandedRoom === room.id;

                return (
                  <motion.div
                    key={room.id}
                    layoutId={room.id}
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: colors.card,
                      borderColor:
                        health > 80
                          ? '#10B981'
                          : health > 50
                            ? '#F59E0B'
                            : '#EF4444',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{room.name}</h4>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          {room.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{health}</div>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          Health
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          Occupancy
                        </p>
                        <p className="font-semibold">{sensors.occupancy}</p>
                      </div>
                      <div>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          Temp
                        </p>
                        <p className="font-semibold">{sensors.temperature}°C</p>
                      </div>
                      <div>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          AQI
                        </p>
                        <p className="font-semibold">{sensors.aqi}</p>
                      </div>
                      <div>
                        <p style={{ color: colors.text.secondary }} className="text-xs">
                          Power
                        </p>
                        <p className="font-semibold">{(sensors.power / 1000).toFixed(1)}kW</p>
                      </div>
                    </div>

                    {/* Expanded view */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t space-y-4"
                          style={{ borderColor: colors.border.primary }}
                        >
                          {/* Health Score Gauge */}
                          <div className="flex justify-center py-2">
                            <HealthScoreGauge score={health} size={140} />
                          </div>

                          {/* Detailed Sensors */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p style={{ color: colors.text.secondary }} className="text-xs">
                                Humidity
                              </p>
                              <p>{sensors.humidity}%</p>
                            </div>
                            <div>
                              <p style={{ color: colors.text.secondary }} className="text-xs">
                                CO2
                              </p>
                              <p>{sensors.co2} ppm</p>
                            </div>
                            <div>
                              <p style={{ color: colors.text.secondary }} className="text-xs">
                                Noise
                              </p>
                              <p>{sensors.noise} dB</p>
                            </div>
                            <div>
                              <p style={{ color: colors.text.secondary }} className="text-xs">
                                Voltage
                              </p>
                              <p>{sensors.voltage}V</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border flex flex-col"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Insights
              </h3>
              <motion.button
                onClick={() => setShowAIReasoning(!showAIReasoning)}
                whileHover={{ scale: 1.1 }}
              >
                {showAIReasoning ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {showAIReasoning && aiReasoning.length > 0 ? (
                <div
                  className="p-3 rounded-lg text-xs font-mono space-y-1"
                  style={{
                    backgroundColor: colors.bg.secondary,
                  }}
                >
                  {aiReasoning.map((line, idx) => (
                    <div key={idx}>
                      {line.startsWith('⚠️') ? (
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
                <div style={{ color: colors.text.secondary }} className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Active Alerts</p>
                      <p>{alerts.length} alerts</p>
                    </div>
                  </div>
                  <div className="border-t pt-2" style={{ borderColor: colors.border.primary }}>
                    {alerts.slice(0, 3).map((alert, idx) => (
                      <div key={idx} className="py-2">
                        <p className="font-semibold text-xs uppercase">{alert.severity}</p>
                        <p>{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              AI Recommendations
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.bg.secondary,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor:
                          rec.priority === 'HIGH'
                            ? '#EF4444'
                            : rec.priority === 'MEDIUM'
                              ? '#FBBF24'
                              : '#10B981',
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{rec.action}</p>
                      <p style={{ color: colors.text.secondary }} className="text-sm">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Brain icon component
function Brain(props) {
  return (
    <svg
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
    </svg>
  );
}
