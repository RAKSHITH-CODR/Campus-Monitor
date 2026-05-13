import { useState, useEffect } from 'react';
import { roomsAPI, analyticsAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Loader, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function AnalyticsPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [analytics, setAnalytics] = useState({
    temperature: null,
    energy: null,
    aqi: null,
  });

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadAnalytics();
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await roomsAPI.getAll();
      const roomsList = response.rooms || [];
      setRooms(roomsList);
      if (roomsList.length > 0) {
        setSelectedRoom(roomsList[0]._id);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const [tempData, energyData, aqiData] = await Promise.all([
        analyticsAPI.getTemperature(selectedRoom).catch(() => ({ data: [] })),
        analyticsAPI.getEnergy(selectedRoom).catch(() => ({ data: [] })),
        analyticsAPI.getAQI(selectedRoom).catch(() => ({ data: [] })),
      ]);

      setAnalytics({
        temperature: tempData,
        energy: energyData,
        aqi: aqiData,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalyticsError(err.message || 'Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRetry = () => {
    if (selectedRoom) {
      loadAnalytics();
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const selectedRoomData = rooms.find(r => r._id === selectedRoom);

  return (
    <div className="section">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-6">Analytics</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error loading rooms</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Room Selector */}
        <div className="flex items-end gap-4 mb-8 flex-wrap">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-[250px]"
          >
            <label className="block text-sm font-medium text-slate-300 mb-3">
              📊 Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-600/30 bg-slate-700/30 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
            >
              <option value="">Choose a room...</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/50 text-blue-200 hover:from-blue-500/40 hover:to-cyan-500/40 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Analytics Error */}
      {analyticsError && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Error loading analytics</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{analyticsError}</p>
            <button
              onClick={handleRetry}
              className="mt-3 px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {analyticsLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Temperature Chart */}
          {analytics.temperature?.data && Array.isArray(analytics.temperature.data) && analytics.temperature.data.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                <h2 className="text-xl font-heading font-bold text-white">Temperature Trend (24h)</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.temperature.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,150,0.2)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="currentColor"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="currentColor" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => value?.toFixed(1)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card text-center py-12 border border-slate-600/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            >
              <p className="text-slate-400">No temperature data available</p>
            </motion.div>
          )}

          {/* Energy Chart */}
          {analytics.energy?.data && Array.isArray(analytics.energy.data) && analytics.energy.data.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 border border-green-500/30 hover:border-green-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-400 group-hover:rotate-12 transition-transform" />
                <h2 className="text-xl font-heading font-bold text-white">Energy Consumption (24h)</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.energy.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,150,0.2)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="currentColor"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="currentColor" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => value?.toFixed(1)}
                  />
                  <Legend />
                  <Bar type="monotone" dataKey="value" fill="#10b981" name="Energy (W)" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card text-center py-12 border border-slate-600/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
            >
              <p className="text-slate-400">No energy data available</p>
            </motion.div>
          )}

          {/* AQI Chart */}
          {analytics.aqi?.data && Array.isArray(analytics.aqi.data) && analytics.aqi.data.length > 0 ? (
            <div className="card">
              <h2 className="text-xl font-heading font-bold mb-6">Air Quality Index (24h)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.aqi.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="currentColor"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="currentColor" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => value?.toFixed(1)}
                  />
                  <Area type="monotone" dataKey="value" fill="#06b6d4" stroke="#0891b2" name="AQI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No air quality data available</p>
            </div>
          )}

          {/* No Data State */}
          {!analytics.temperature?.data?.length && !analytics.energy?.data?.length && !analytics.aqi?.data?.length && !analyticsLoading && (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No analytics data available for {selectedRoomData?.name || 'this room'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
