/**
 * AlertsPage — FIXED
 *
 * Fixes from original:
 * 1. Imported DEFAULT_BUILDING_CONFIG from '../services/simulationEngine' which doesn't exist.
 *    This was crashing the entire page on load. Removed import, now derives rooms from
 *    the fetched alerts themselves (passed directly to AlertHeatmap).
 * 2. AlertHeatmap now receives `rooms` derived from the fetched rooms API or from alerts,
 *    instead of from a non-existent simulationEngine.
 * 3. loadRooms() was never called — added a rooms state and fetch so AlertHeatmap
 *    can display proper room names even for rooms with 0 alerts.
 */

import { useState, useEffect, useRef } from 'react';
import { alertsAPI, roomsAPI } from '../services/api';
import { onNewAlert } from '../services/socket';
import {
  CheckCircle2, AlertCircle, Filter, Loader, Clock,
  Thermometer, ChevronLeft, ChevronRight, Download, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatters } from '../utils/formatters';
import { useStore } from '../store/useStore';
import { THEME_COLORS } from '../config/theme';
import AlertHeatmap from '../components/AlertHeatmap';

function AlertsPage() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const [alerts, setAlerts] = useState([]);
  const [rooms, setRooms] = useState([]); // FIX: added rooms state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [resolveError, setResolveError] = useState('');
  const [resolving, setResolving] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const listenerRef = useRef(false);

  useEffect(() => {
  loadAlerts();
  loadRooms();

  let cleanup = null;

  if (!listenerRef.current) {
    listenerRef.current = true;

    cleanup = onNewAlert((alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
  }

  return () => {
    if (cleanup) cleanup();
  };
}, [page]);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError('');
      const response = await alertsAPI.getAll(page, 15);
      setAlerts(response.data || []);
      if (response.pagination) setPagination(response.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // FIX: fetch all rooms so AlertHeatmap shows every room (including ones with 0 alerts)
  async function loadRooms() {
    try {
      const response = await roomsAPI.getAll(1, 100);
      setRooms(response.data || response.rooms || []);
    } catch {
      // Non-critical — AlertHeatmap will derive rooms from alerts as fallback
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'ACTIVE';
    if (filter === 'resolved') return alert.status === 'RESOLVED';
    if (filter === 'critical') return alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
    return true;
  });

  const handleResolve = async (alertId) => {
    try {
      setResolving(alertId);
      setResolveError('');
      await alertsAPI.resolve(alertId);
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status: 'RESOLVED' } : a));
    } catch (err) {
      setResolveError(err.message || 'Failed to resolve alert');
    } finally {
      setResolving(null);
    }
  };

  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { if (page < pagination.pages) setPage(page + 1); };

  const handleExport = async (format) => {
    try {
      const response = await alertsAPI.export(format);
      const blob = new Blob([response], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alerts-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setResolveError('Export failed. Please try again.');
    }
  };

  const getSeverityCard = (severity) => {
    if (isDark) {
      const map = {
        CRITICAL: 'bg-gradient-to-br from-red-900/30 to-pink-900/20 border-red-500/40 hover:border-red-400/60',
        HIGH: 'bg-gradient-to-br from-orange-900/30 to-amber-900/20 border-orange-500/40 hover:border-orange-400/60',
        MEDIUM: 'bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border-yellow-500/40 hover:border-yellow-400/60',
        LOW: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-blue-500/40 hover:border-blue-400/60',
      };
      return map[severity] || map.MEDIUM;
    } else {
      const map = {
        CRITICAL: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 hover:border-red-400',
        HIGH: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 hover:border-orange-400',
        MEDIUM: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 hover:border-yellow-400',
        LOW: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 hover:border-blue-400',
      };
      return map[severity] || map.MEDIUM;
    }
  };

  const getSeverityBadge = (severity) => {
    if (isDark) {
      const map = {
        CRITICAL: 'bg-red-500/20 text-red-300 border border-red-500/50',
        HIGH: 'bg-orange-500/20 text-orange-300 border border-orange-500/50',
        MEDIUM: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50',
        LOW: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
      };
      return map[severity] || map.MEDIUM;
    } else {
      const map = {
        CRITICAL: 'bg-red-100 text-red-700 border border-red-300',
        HIGH: 'bg-orange-100 text-orange-700 border border-orange-300',
        MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
        LOW: 'bg-blue-100 text-blue-700 border border-blue-300',
      };
      return map[severity] || map.MEDIUM;
    }
  };

  const filterConfig = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'active', label: 'Active', count: alerts.filter(a => a.status === 'ACTIVE').length },
    { id: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'RESOLVED').length },
    { id: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length },
  ];

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">

      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`p-6 rounded-2xl border flex items-start justify-between ${
          isDark
            ? 'bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-700/50'
            : 'bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Bell className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h1 className={`text-3xl font-bold font-heading ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Alerts Center
              </h1>
            </div>
            <p className={`ml-[3.25rem] text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {pagination.total} total alerts — Page {pagination.page} of {pagination.pages}
            </p>
          </div>

          <div className="flex gap-2">
            {['csv', 'json'].map(fmt => (
              <motion.button key={fmt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleExport(fmt)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium border transition-all ${
                  fmt === 'csv'
                    ? isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    : isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Download className="w-4 h-4" /> {fmt.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Errors */}
      {error && (
        <div className={`mb-6 p-4 rounded-xl border flex gap-3 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>Error loading alerts</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            <button onClick={loadAlerts} className="mt-3 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors">Retry</button>
          </div>
        </div>
      )}

      {resolveError && (
        <div className={`mb-6 p-4 rounded-xl border flex gap-3 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <p className={`text-sm font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>{resolveError}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={`mb-6 p-1.5 rounded-xl flex gap-1 flex-wrap ${
        isDark ? 'bg-slate-800/40 border border-slate-700/40' : 'bg-gray-100 border border-gray-200'
      }`}>
        {filterConfig.map((f, idx) => (
          <motion.button key={f.id}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => { setFilter(f.id); setPage(1); }}
            className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              filter === f.id
                ? isDark ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'bg-white text-blue-700 shadow-md border border-blue-200'
                : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              filter === f.id
                ? isDark ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                : isDark ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}>{f.count}</span>
          </motion.button>
        ))}
      </div>

      {/* Alert Heatmap — FIX: pass rooms from API, no simulationEngine import */}
      <div className={`mb-8 p-6 rounded-2xl border ${
        isDark
          ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
      }`}>
        <AlertHeatmap
          alerts={alerts}
          rooms={rooms}  // rooms from API — AlertHeatmap handles empty array gracefully
        />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, idx) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.28, delay: idx * 0.04 }}
                whileHover={{ y: -2 }}
                className={`relative rounded-2xl p-5 border transition-all overflow-hidden ${getSeverityCard(alert.severity)}`}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <motion.span
                        animate={{ scale: alert.status === 'ACTIVE' ? [1, 1.08, 1] : 1 }}
                        transition={{ duration: 1.6, repeat: alert.status === 'ACTIVE' ? Infinity : 0 }}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(alert.severity)}`}
                      >
                        {alert.severity === 'CRITICAL' ? '🔴' : alert.severity === 'HIGH' ? '🟠' : alert.severity === 'MEDIUM' ? '🟡' : '🔵'} {alert.severity}
                      </motion.span>
                      <h3 className={`font-semibold text-base leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {alert.message}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Room</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{alert.room}</p>
                      </div>
                      <div>
                        <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                        <motion.p
                          animate={{ opacity: alert.status === 'ACTIVE' ? [0.7, 1, 0.7] : 1 }}
                          transition={{ duration: 1.5, repeat: alert.status === 'ACTIVE' ? Infinity : 0 }}
                          className={`text-sm font-semibold ${
                            alert.status === 'RESOLVED'
                              ? isDark ? 'text-green-400' : 'text-green-600'
                              : isDark ? 'text-orange-400' : 'text-orange-600'
                          }`}
                        >
                          {alert.status === 'ACTIVE' ? '● ' : '✓ '}{alert.status}
                        </motion.p>
                      </div>
                      <div>
                        <p className={`text-xs mb-0.5 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" /> Created
                        </p>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatters.timeAgo(alert.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs mb-0.5 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Thermometer className="w-3 h-3" /> Temp
                        </p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          {alert.sensorData?.temperature?.toFixed(1) || 'N/A'}°C
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {alert.status === 'ACTIVE' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(alert._id)}
                        disabled={resolving === alert._id}
                        className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50 border ${
                          isDark
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {resolving === alert._id && <Loader className="w-4 h-4 animate-spin" />}
                        {resolving === alert._id ? 'Resolving...' : 'Resolve'}
                      </motion.button>
                    )}
                    {alert.status === 'RESOLVED' && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
                        isDark ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-green-50 border-green-300 text-green-700'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" /> Resolved
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`text-center py-20 rounded-2xl border ${
                isDark ? 'bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border-slate-700/40' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
              }`}
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <AlertCircle className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
              </motion.div>
              <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {alerts.length === 0 ? '✨ All clear! No alerts at this time' : '🔍 No alerts matching your filter'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center justify-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handlePrevPage} disabled={page === 1}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 border transition-all disabled:opacity-40 ${
              isDark ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </motion.button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <motion.button key={p} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  p === page
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : isDark ? 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleNextPage} disabled={page === pagination.pages}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 border transition-all disabled:opacity-40 ${
              isDark ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default AlertsPage;
