import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roomsAPI, sensorsAPI, alertsAPI } from '../services/api';
import { initSocket, onSensorUpdate, onNewAlert, onRoomUpdate } from '../services/socket';
import { useStore } from '../store/useStore';
import AuthWallModal from '../components/AuthWallModal';
import { 
  AlertCircle, TrendingUp, Zap, Wind, Thermometer, Wifi, 
  AlertTriangle, Check, Clock, RefreshCw, Activity 
} from 'lucide-react';

function SkeletonLoader({ count = 3 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-slate-600/50 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-600/50 rounded w-2/3"></div>
            <div className="h-4 bg-slate-600/50 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useStore();
  const [rooms, setRooms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ avgTemp: 0, totalEnergy: 0, activeAlerts: 0 });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const listenerRef = useRef(false);
  const socketRef = useRef(null);

  // Initialize Socket.IO and load dashboard
  useEffect(() => {
    if (!isAuthenticated) return;

    loadDashboard();
    setupSocketListeners();

    return () => {
      if (listenerRef.current) {
        listenerRef.current = false;
      }
    };
  }, [isAuthenticated]);

  const setupSocketListeners = () => {
    try {
      socketRef.current = initSocket();

      socketRef.current.on('connect', () => {
        setConnectionStatus('connected');
        console.log('[Dashboard] Socket connected:', socketRef.current.id);
      });

      socketRef.current.on('disconnect', () => {
        setConnectionStatus('disconnected');
        console.log('[Dashboard] Socket disconnected');
      });

      socketRef.current.on('reconnecting', () => {
        setConnectionStatus('connecting');
        console.log('[Dashboard] Socket reconnecting');
      });

      socketRef.current.on('sensorUpdate', (data) => {
        console.log('[Dashboard] Sensor update:', data);
        setRooms(prev => 
          prev.map(room => 
            (room._id === data.room || room.name === data.room) 
              ? { 
                  ...room, 
                  latestSensor: {
                    ...data,
                    aqi: data.airQuality || data.aqi,
                  },
                  updatedAt: new Date() 
                }
              : room
          )
        );
        setLastUpdate(new Date());
      });

      socketRef.current.on('roomUpdate', (data) => {
        console.log('[Dashboard] Room update:', data);
        setRooms(prev =>
          prev.map(room =>
            room._id === data._id || room.name === data.name
              ? { ...room, ...data }
              : room
          )
        );
      });

      socketRef.current.on('newAlert', (alert) => {
        console.log('[Dashboard] New alert:', alert);
        setAlerts(prev => [alert, ...prev].slice(0, 10));
      });

      listenerRef.current = true;
    } catch (err) {
      console.error('[Dashboard] Socket setup error:', err);
      setConnectionStatus('error');
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch rooms (get first page with all rooms) and active alerts
      const [roomsResponse, alertsResponse] = await Promise.all([
        roomsAPI.getAll(1, 100),
        alertsAPI.getActive(1, 100),
      ]);

      const roomsData = roomsResponse.data || roomsResponse.rooms || [];
      const alertsData = alertsResponse.data || alertsResponse.alerts || [];

      console.log('[Dashboard] Rooms loaded:', roomsData);
      console.log('[Dashboard] Alerts loaded:', alertsData);

      setRooms(roomsData);
      setAlerts(alertsData);
      calculateStats(roomsData);
    } catch (err) {
      console.error('[Dashboard] Load error:', err);
      setError(err.error || 'Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (roomsData) => {
    if (!roomsData || roomsData.length === 0) {
      setStats({ avgTemp: 0, totalEnergy: 0, activeAlerts: 0 });
      return;
    }

    let totalTemp = 0;
    let totalEnergy = 0;
    let count = 0;

    roomsData.forEach(room => {
      if (room.latestSensor) {
        totalTemp += room.latestSensor.temperature || 0;
        totalEnergy += room.latestSensor.energyUsage || 0;
        count++;
      }
    });

    const avgTemp = count > 0 ? (totalTemp / count).toFixed(1) : '0';
    const avgEnergy = count > 0 ? Math.round((totalEnergy / count)) : '0';

    console.log('[Dashboard] Stats calculated:', { avgTemp, avgEnergy, activeAlerts: alerts.length, count, roomsWithData: count });

    setStats({
      avgTemp,
      totalEnergy: avgEnergy,
      activeAlerts: alerts.length,
    });
  };

  // Recalculate stats whenever rooms change
  useEffect(() => {
    calculateStats(rooms);
  }, [rooms, alerts]);

  // Get room status based on alerts
  const getRoomStatus = (roomId) => {
    const roomAlerts = alerts.filter(a => a.room === roomId || a.roomId === roomId);
    if (roomAlerts.length === 0) return { status: 'normal', color: 'bg-green-500', label: 'Normal' };
    if (roomAlerts.some(a => a.severity === 'CRITICAL')) return { status: 'critical', color: 'bg-red-500', label: 'Critical' };
    if (roomAlerts.some(a => a.severity === 'HIGH')) return { status: 'warning', color: 'bg-orange-500', label: 'Warning' };
    return { status: 'info', color: 'bg-yellow-500', label: 'Info' };
  };

  // Show auth wall if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <AuthWallModal isOpen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-50 dark:via-white dark:to-slate-100 p-4 md:p-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome & Status */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-slate-900 mb-2 float-in">
                👋 Welcome back, {user?.name || 'Campus Monitor'}
              </h1>
              <p className="text-slate-400 dark:text-slate-600 text-lg">Real-time facility monitoring system</p>
            </div>
            
            {/* Connection Status */}
            <motion.div 
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-600/30 dark:border-slate-300/30 backdrop-blur-md bg-slate-700/20 dark:bg-white/40"
              animate={{ 
                boxShadow: connectionStatus === 'connected' 
                  ? ['0 0 20px rgba(34, 197, 94, 0.3)', '0 0 30px rgba(34, 197, 94, 0.6)', '0 0 20px rgba(34, 197, 94, 0.3)']
                  : ['0 0 15px rgba(234, 179, 8, 0.2)', '0 0 25px rgba(234, 179, 8, 0.4)', '0 0 15px rgba(234, 179, 8, 0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: connectionStatus === 'connected' ? 2 : 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-semibold text-slate-300 dark:text-slate-700 capitalize tracking-wide">
                {connectionStatus === 'connected' ? '🔗 Live' : connectionStatus === 'connecting' ? '⟳ Connecting' : '✕ Offline'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div 
            className="mb-8 p-4 bg-red-500/10 dark:bg-red-100 border border-red-500/30 dark:border-red-300 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 dark:text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={loadDashboard}
                className="text-xs text-red-400 dark:text-red-600 hover:text-red-300 dark:hover:text-red-700 mt-2 underline"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* KEY METRICS SECTION - Better Layout */}
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white dark:text-slate-900 mb-2">📊 Campus Overview</h2>
            <p className="text-slate-400 dark:text-slate-600">Key metrics at a glance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <SkeletonLoader count={3} />
            ) : (
              <>
                {/* TEMPERATURE CARD */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-6 relative overflow-hidden group bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 border-blue-500/20 dark:border-blue-500/30"
                >
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">🌡️ Temperature</span>
                      <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Thermometer className="w-6 h-6 text-blue-400 dark:text-blue-600" />
                      </motion.div>
                    </div>
                    <p className="stat-number text-5xl mb-3">{stats.avgTemp}°</p>
                    <p className="text-xs text-slate-500 dark:text-slate-600 mb-4">Average across campus</p>
                    <div className="h-2 bg-slate-700/30 dark:bg-slate-300/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min((stats.avgTemp / 30) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* ENERGY CARD */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-6 relative overflow-hidden group bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 border-green-500/20 dark:border-green-500/30"
                >
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">⚡ Energy</span>
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity }}>
                        <Zap className="w-6 h-6 text-green-400 dark:text-green-600" />
                      </motion.div>
                    </div>
                    <p className="stat-number text-5xl mb-3">{stats.totalEnergy}<span className="text-2xl">W</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-600 mb-4">Per room average</p>
                    <div className="h-2 bg-slate-700/30 dark:bg-slate-300/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min((stats.totalEnergy / 400) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* ALERTS CARD */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-6 relative overflow-hidden group bg-gradient-to-br from-red-500/5 to-pink-500/5 dark:from-red-500/10 dark:to-pink-500/10 border-red-500/20 dark:border-red-500/30"
                >
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">🚨 Alerts</span>
                      <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <AlertTriangle className="w-6 h-6 text-red-400 dark:text-red-600" />
                      </motion.div>
                    </div>
                    <p className="stat-number text-5xl mb-3">{stats.activeAlerts}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-600 mb-4">Requiring attention</p>
                    <div className="flex gap-1">
                      {[...Array(Math.min(stats.activeAlerts, 6))].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 h-2 bg-red-500/30 dark:bg-red-600/30 rounded-full overflow-hidden"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                        >
                          <div className="h-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Last Update */}
        <motion.div 
          className="mb-8 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </motion.div>

        {/* Rooms Grid */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white dark:text-slate-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                🏢 Campus Rooms ({rooms.length})
              </motion.h2>
              <motion.p 
                className="text-slate-400 dark:text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Real-time monitoring for all facilities
              </motion.p>
            </div>
            <motion.button
              onClick={loadDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 dark:bg-slate-300/50 hover:bg-slate-600 dark:hover:bg-slate-200 text-slate-300 dark:text-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} />
            </div>
          ) : rooms.length === 0 ? (
            <motion.div 
              className="glass-card p-12 text-center border-slate-500/20 dark:border-slate-700/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Activity className="w-12 h-12 text-slate-500 dark:text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-500 dark:text-slate-600">No rooms available at the moment.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {rooms.map((room, idx) => {
                const roomStatus = getRoomStatus(room._id);
                const sensor = room.latestSensor;

                return (
                  <motion.div
                    key={room._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: "easeOut" },
                      },
                    }}
                    onClick={() => navigate(`/room/${room._id}`)}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    className="group glass-card p-6 relative overflow-hidden cursor-pointer hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all"
                    style={{
                      borderColor: roomStatus.status === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.3)',
                      backgroundColor: roomStatus.status === 'critical' ? 'rgba(239, 68, 68, 0.02)' : 'rgba(59, 130, 246, 0.01)',
                    }}
                  >
                    {/* Animated background blur */}
                    <motion.div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      animate={{ 
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        roomStatus.status === 'critical' 
                          ? 'from-red-500/5 to-pink-500/5' 
                          : 'from-blue-500/5 to-purple-500/5'
                      }`}></div>
                    </motion.div>

                    <div className="relative z-10">
                      {/* Header with room name and status dot */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white dark:text-slate-900 group-hover:text-blue-300 dark:group-hover:text-blue-600 transition-colors">
                            {room.name}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                            📍 {room.type} • Floor {room.floor}
                          </p>
                        </div>
                        <motion.div 
                          className={`w-4 h-4 rounded-full shadow-lg ${
                            roomStatus.status === 'critical' 
                              ? 'bg-red-500' 
                              : roomStatus.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          animate={{ 
                            scale: roomStatus.status === 'critical' ? [1, 1.4, 1] : [1, 1.15, 1],
                            boxShadow: roomStatus.status === 'critical' 
                              ? ['0 0 8px rgba(239, 68, 68, 0.5)', '0 0 16px rgba(239, 68, 68, 0.7)', '0 0 8px rgba(239, 68, 68, 0.5)']
                              : ['0 0 6px rgba(59, 130, 246, 0.3)', '0 0 12px rgba(59, 130, 246, 0.5)', '0 0 6px rgba(59, 130, 246, 0.3)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>

                      {/* Status Badge */}
                      <motion.div 
                        className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border transition-all group-hover:shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        style={{
                          borderColor: roomStatus.status === 'critical' ? 'rgba(239, 68, 68, 0.5)' : roomStatus.status === 'warning' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.5)',
                          backgroundColor: roomStatus.status === 'critical' ? 'rgba(239, 68, 68, 0.15)' : roomStatus.status === 'warning' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: roomStatus.status === 'critical' ? '#ef4444' : roomStatus.status === 'warning' ? '#eab308' : '#22c55e'
                        }}
                      >
                        <span>
                          {roomStatus.status === 'critical' ? '🔴 CRITICAL' : roomStatus.status === 'warning' ? '🟠 Warning' : '🟢 Normal'}
                        </span>
                      </motion.div>

                      {/* Sensor Data */}
                      {sensor ? (
                        <div className="space-y-2">
                          {/* Temperature */}
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-lg hover:from-blue-500/20 hover:to-cyan-500/20 transition-all border border-blue-500/20 dark:border-blue-600/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Thermometer className="w-4 h-4 text-blue-400 dark:text-blue-600" />
                              </motion.div>
                              <span className="text-xs text-slate-400 dark:text-slate-600">Temperature</span>
                            </div>
                            <motion.span 
                              className="font-bold text-blue-300 dark:text-blue-600 text-sm"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {sensor.temperature?.toFixed(1)}°C
                            </motion.span>
                          </motion.div>

                          {/* Air Quality */}
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/10 to-sky-500/10 dark:from-cyan-600/10 dark:to-sky-600/10 rounded-lg hover:from-cyan-500/20 hover:to-sky-500/20 transition-all border border-cyan-500/20 dark:border-cyan-600/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2">
                              <Wind className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
                              <span className="text-xs text-slate-400 dark:text-slate-600">Air Quality</span>
                            </div>
                            <span className="font-bold text-cyan-300 dark:text-cyan-600 text-sm">{(sensor.aqi || sensor.airQuality || 'N/A')}</span>
                          </motion.div>

                          {/* Energy */}
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-600/10 dark:to-emerald-600/10 rounded-lg hover:from-green-500/20 hover:to-emerald-500/20 transition-all border border-green-500/20 dark:border-green-600/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, linear: true }}
                              >
                                <Zap className="w-4 h-4 text-green-400 dark:text-green-600" />
                              </motion.div>
                              <span className="text-xs text-slate-400 dark:text-slate-600">Power Usage</span>
                            </div>
                            <span className="font-bold text-green-300 dark:text-green-600 text-sm">{sensor.energyUsage?.toFixed(0)}W</span>
                          </motion.div>

                          {/* Motion */}
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/10 dark:to-pink-600/10 rounded-lg hover:from-purple-500/20 hover:to-pink-500/20 transition-all border border-purple-500/20 dark:border-purple-600/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ scale: sensor.motion ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Activity className="w-4 h-4 text-purple-400 dark:text-purple-600" />
                              </motion.div>
                              <span className="text-xs text-slate-400 dark:text-slate-600">Motion Status</span>
                            </div>
                            <motion.span 
                              className="font-bold text-sm"
                              animate={{ opacity: sensor.motion ? [0.6, 1, 0.6] : 1, scale: sensor.motion ? [1, 1.1, 1] : 1 }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              {sensor.motion ? '🟢 Active' : '🔴 Idle'}
                            </motion.span>
                          </motion.div>
                        </div>
                      ) : (
                        <motion.div 
                          className="p-4 glass-card rounded-lg text-center border-slate-500/20 dark:border-slate-700/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block"
                          >
                            <AlertCircle className="w-5 h-5 text-slate-500 dark:text-slate-600 mx-auto mb-2" />
                          </motion.div>
                          <p className="text-xs text-slate-400 dark:text-slate-600">Waiting for data...</p>
                        </motion.div>
                      )}

                      {/* Live Indicator */}
                      <motion.div 
                        className="mt-4 pt-4 border-t border-slate-600/30 dark:border-slate-700/30 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-600"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-slate-500 dark:text-slate-600">{sensor ? '🟢 Live Data' : '⏳ Awaiting...'}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Recent Alerts Section */}
        {alerts.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-white dark:text-slate-900 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ⚠️ Recent Alerts
            </motion.h2>
            <p className="text-slate-400 dark:text-slate-600 mb-6">Latest system notifications</p>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="glass-card p-4 flex items-center justify-between border-l-4 group hover:border-l-6 transition-all"
                  style={{
                    borderLeftColor: alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'HIGH' ? '#f97316' : '#eab308'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-3 h-3 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500' :
                        alert.severity === 'HIGH' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                    <div>
                      <p className="text-white dark:text-slate-900 text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">📍 Room: {alert.room}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 dark:text-red-600' :
                    alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 dark:text-orange-600' :
                    'bg-yellow-500/20 text-yellow-400 dark:text-yellow-600'
                  }`}>{alert.severity}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
