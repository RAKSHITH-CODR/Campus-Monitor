/**
 * Alert Heatmap Component — FIXED
 *
 * Fixes from original:
 * 1. Was keying on alert.roomId (undefined) — now uses alert.room (the string name from backend)
 * 2. Was importing DEFAULT_BUILDING_CONFIG from simulationEngine (doesn't exist) — now derives
 *    rooms directly from the alerts array itself, so it works with zero extra deps
 * 3. getHeatOpacity applied to the outer wrapper, but backgroundColor was also set on the inner
 *    div — combined into one element to avoid double-transparency stacking
 */

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AlertHeatmap({ alerts = [], rooms = [] }) {
  const { theme } = useStore();
  const isDark = theme === 'dark';

  // ── Derive room list ─────────────────────────────────────────────────────────
  // If a rooms prop is passed use it, otherwise build from the alerts themselves.
  // This means the component works even when simulationEngine isn't imported.
  const roomList = rooms.length > 0
    ? rooms
    : [...new Set(alerts.map(a => a.room).filter(Boolean))].map(name => ({
        id: name,   // use name as id since backend stores name, not roomId
        name,
      }));

  // ── Count alerts per room ────────────────────────────────────────────────────
  // Backend alerts use `alert.room` (e.g. "Lab 1"), not `alert.roomId`
  const alertCounts = {};
  const severityCounts = {};

  alerts.forEach((alert) => {
    const key = alert.room || 'unknown';  // FIX: was alert.roomId
    alertCounts[key] = (alertCounts[key] || 0) + 1;
    severityCounts[key] = {
      ...severityCounts[key],
      [alert.severity]: (severityCounts[key]?.[alert.severity] || 0) + 1,
    };
  });

  const maxCount = Math.max(...Object.values(alertCounts), 1); // avoid /0

  const getHeatColor = (count) => {
    const intensity = count / maxCount;
    if (intensity >= 0.8) return '#dc2626';
    if (intensity >= 0.6) return '#ef4444';
    if (intensity >= 0.4) return '#f97316';
    if (intensity >= 0.2) return '#eab308';
    return '#10b981';
  };

  // Map room prop shape: rooms from backend have ._id and .name;
  // rooms derived from alerts have .id and .name
  const getRoomKey = (room) => room._id || room.id || room.name;

  if (roomList.length === 0) {
    return (
      <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        No alert data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Alert Distribution</h4>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          {alerts.filter(a => a.status === 'ACTIVE').length} Active
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {roomList.map((room) => {
          const key = getRoomKey(room);
          const count = alertCounts[key] || alertCounts[room.name] || 0;
          const severity = severityCounts[key] || severityCounts[room.name];
          const heatColor = getHeatColor(count);
          const opacity = count === 0 ? 0.35 : 0.4 + (count / maxCount) * 0.6;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              <div
                className="w-full aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all"
                style={{
                  backgroundColor: heatColor,
                  opacity,
                  borderColor: heatColor,
                }}
              >
                <span className="text-white drop-shadow">{count}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-gray-300">Total alerts: {count}</div>
                  {severity && (
                    <>
                      {severity.CRITICAL && <div className="text-red-400">🔴 Critical: {severity.CRITICAL}</div>}
                      {severity.HIGH && <div className="text-orange-400">🟠 High: {severity.HIGH}</div>}
                      {severity.MEDIUM && <div className="text-yellow-400">🟡 Medium: {severity.MEDIUM}</div>}
                      {severity.LOW && <div className="text-blue-400">🔵 Low: {severity.LOW}</div>}
                    </>
                  )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>

              {/* Room Label */}
              <div className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 truncate">
                {room.name.split(' ').slice(0, 2).join(' ')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
          {[
            { color: '#10b981', label: 'None' },
            { color: '#eab308', label: 'Low' },
            { color: '#f97316', label: 'Medium' },
            { color: '#ef4444', label: 'High' },
            { color: '#dc2626', label: 'Critical' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
