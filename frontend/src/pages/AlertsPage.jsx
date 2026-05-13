import { useState, useEffect, useRef } from 'react';
import { alertsAPI } from '../services/api';
import { onNewAlert, removeListener } from '../services/socket';
import { CheckCircle2, AlertCircle, Filter, Loader, Clock, Thermometer, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatters } from '../utils/formatters';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
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

    if (!listenerRef.current) {
      listenerRef.current = true;
      onNewAlert((alert) => {
        setAlerts(prev => [alert, ...prev]);
      });
    }

    return () => {
      removeListener('newAlert');
    };
  }, [page]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await alertsAPI.getAll(page, 15);
      setAlerts(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err.message || 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error resolving alert:', err);
      setResolveError(err.message || 'Failed to resolve alert');
    } finally {
      setResolving(null);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.pages) setPage(page + 1);
  };

  const handleExport = async (format) => {
    try {
      const response = await alertsAPI.export(format);
      
      // Create a blob and download
      const blob = new Blob([response], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alerts-${Date.now()}.${format === 'json' ? 'json' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setResolveError('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">Alerts Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total: {pagination.total} alerts | Page {pagination.page} of {pagination.pages}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error loading alerts</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={loadAlerts}
              className="mt-3 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Resolve Error */}
      {resolveError && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Failed to resolve alert</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{resolveError}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {['all', 'active', 'resolved', 'critical'].map((f, idx) => (
            <motion.button
              key={f}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm border ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50 text-white'
                  : 'bg-slate-700/20 border-slate-600/30 text-slate-300 hover:border-slate-500/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('csv')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 text-green-200 hover:from-green-500/40 hover:to-emerald-500/40 flex items-center gap-2 text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('json')}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 text-purple-200 hover:from-purple-500/40 hover:to-pink-500/40 flex items-center gap-2 text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            JSON
          </motion.button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, idx) => {
              const severityColors = {
                CRITICAL: 'from-red-500/20 to-pink-500/20 border-red-500/30 hover:border-red-500/50',
                HIGH: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 hover:border-orange-500/50',
                MEDIUM: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 hover:border-yellow-500/50',
                LOW: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-500/50'
              };
              const badgeColors = {
                CRITICAL: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/50',
                HIGH: 'px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/50',
                MEDIUM: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/50',
                LOW: 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50'
              };

              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`glass-card p-6 border transition-all group overflow-hidden bg-gradient-to-br ${severityColors[alert.severity] || severityColors.MEDIUM}`}
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent"></div>

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          animate={{ scale: alert.status === 'ACTIVE' ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 1.5, repeat: alert.status === 'ACTIVE' ? Infinity : 0 }}
                        >
                          <span className={badgeColors[alert.severity] || badgeColors.MEDIUM}>
                            {alert.severity === 'CRITICAL' ? '🔴' : alert.severity === 'HIGH' ? '🟠' : alert.severity === 'MEDIUM' ? '🟡' : '🔵'} {alert.severity}
                          </span>
                        </motion.div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-blue-200 transition-colors">
                          {alert.message}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 + 0.1 }}>
                          <p className="text-xs text-slate-400 mb-1">Room</p>
                          <p className="font-medium text-slate-200">{alert.room}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 + 0.15 }}>
                          <p className="text-xs text-slate-400 mb-1">Status</p>
                          <motion.p
                            animate={{ opacity: alert.status === 'ACTIVE' ? [0.7, 1, 0.7] : 1 }}
                            transition={{ duration: 1.5, repeat: alert.status === 'ACTIVE' ? Infinity : 0 }}
                            className={`font-medium ${alert.status === 'RESOLVED' ? 'text-green-400' : 'text-orange-400'}`}
                          >
                            {alert.status === 'ACTIVE' ? '🔴 ' : '✓ '}{alert.status}
                          </motion.p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 + 0.2 }}>
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created
                          </p>
                          <p className="font-medium text-slate-300 text-sm">{formatters.timeAgo(alert.createdAt)}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 + 0.25 }}>
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            Temp
                          </p>
                          <p className="font-medium text-blue-300">{alert.sensorData?.temperature?.toFixed(1) || 'N/A'}°C</p>
                        </motion.div>
                      </div>
                    </div>

                    {alert.status === 'ACTIVE' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(alert._id)}
                        disabled={resolving === alert._id}
                        className="px-4 py-2 whitespace-nowrap rounded-lg font-medium bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 text-green-200 hover:from-green-500/40 hover:to-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                      >
                        {resolving === alert._id && <Loader className="w-4 h-4 animate-spin" />}
                        {resolving === alert._id ? 'Resolving...' : 'Resolve'}
                      </motion.button>
                    )}
                    {alert.status === 'RESOLVED' && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Resolved</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card text-center py-16 border border-slate-600/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              </motion.div>
              <p className="text-slate-300">
                {alerts.length === 0 ? '✨ All clear! No alerts at this time' : '🔍 No alerts matching your filter'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50 text-white hover:from-blue-500/40 hover:to-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </motion.button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  p === page
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-slate-700/20 border border-slate-600/30 text-slate-300 hover:border-slate-500/50'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50 text-white hover:from-blue-500/40 hover:to-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default AlertsPage;
