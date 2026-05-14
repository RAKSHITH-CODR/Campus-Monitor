import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
} from 'recharts';
import { TrendingUp, Zap, Droplets, Wind, Activity, Calendar, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { THEME_COLORS } from '../config/theme';
import ReportExport from '../components/ReportExport';

export default function AnalyticsPage() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [energyMetrics, setEnergyMetrics] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Generate mock analytics data
  useEffect(() => {
    const hours = [];
    const days = [];

    // Generate hourly data
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: `${i}:00`,
        occupancy: Math.floor(Math.random() * 100) + 20,
        temperature: 22 + Math.random() * 6,
        energy: Math.floor(Math.random() * 3000) + 1000,
        aqi: Math.floor(Math.random() * 200) + 50,
      });
    }

    // Generate daily data
    const days_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      days.push({
        day: days_names[i],
        occupancy: Math.floor(Math.random() * 80) + 30,
        temperature: 22 + Math.random() * 4,
        energy: Math.floor(Math.random() * 2500) + 1500,
        efficiency: Math.floor(Math.random() * 40) + 60,
      });
    }

    // Energy metrics
    const energyData = [
      { name: 'HVAC', value: 4200, percentage: 45 },
      { name: 'Lighting', value: 2100, percentage: 22 },
      { name: 'Equipment', value: 1890, percentage: 20 },
      { name: 'Other', value: 900, percentage: 13 },
    ];

    setHourlyData(hours);
    setDailyData(days);
    setEnergyMetrics(energyData);
  }, []);

  const COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'];

  return (
    <div
      className="min-h-screen transition-colors duration-300 p-4 md:p-6"
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Analytics & Insights</h1>
        <p style={{ color: colors.text.secondary }}>
          Comprehensive data analysis and trend visualization
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 mb-8 flex-wrap"
      >
        {['24h', '7d', '30d', '90d'].map((range) => (
          <motion.button
            key={range}
            onClick={() => setSelectedTimeRange(range)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor:
                selectedTimeRange === range
                  ? '#3B82F6'
                  : colors.bg.secondary,
              color:
                selectedTimeRange === range
                  ? '#FFFFFF'
                  : colors.text.secondary,
            }}
          >
            {range}
          </motion.button>
        ))}
        <ReportExport 
          sensorData={{}} 
          alerts={[]}
        />
      </motion.div>

      {/* Hourly Trends */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 mb-8 lg:grid-cols-2"
      >
        {/* Occupancy Trend */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border.primary,
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Hourly Occupancy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border.primary}
              />
              <XAxis
                dataKey="hour"
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
                fill="url(#colorOcc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Consumption */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border.primary,
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Hourly Energy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border.primary}
              />
              <XAxis
                dataKey="hour"
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
              <Bar dataKey="energy" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Daily Analytics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 mb-8 lg:grid-cols-2"
      >
        {/* Daily Comparison */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border.primary,
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border.primary}
              />
              <XAxis
                dataKey="day"
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
              <Legend />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#F59E0B"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Efficiency */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border.primary,
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Energy Efficiency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border.primary}
              />
              <XAxis
                dataKey="day"
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
              <Bar dataKey="efficiency" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Energy Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-xl border mb-8"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border.primary,
        }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy Breakdown by System
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={energyMetrics}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {energyMetrics.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.border.primary}`,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: 'Avg Occupancy', value: '68', unit: 'people' },
          { label: 'Avg Temperature', value: '24.5', unit: '°C' },
          { label: 'Total Energy', value: '2.4', unit: 'MWh' },
          { label: 'Efficiency Score', value: '78', unit: '%' },
        ].map((metric, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border.primary,
            }}
          >
            <p style={{ color: colors.text.secondary }} className="text-sm">
              {metric.label}
            </p>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
            <p style={{ color: colors.text.tertiary }} className="text-xs">
              {metric.unit}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
