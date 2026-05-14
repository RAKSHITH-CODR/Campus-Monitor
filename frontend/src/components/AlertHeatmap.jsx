/**
 * Alert Heatmap Component
 * Shows which rooms trigger most alerts (visual heatmap)
 */

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { THEME_COLORS } from '../config/theme';
import { useStore } from '../store/useStore';

export default function AlertHeatmap({ alerts = [], rooms = [], buildingId = 'block-a' }) {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // Count alerts per room
  const alertCounts = {};
  const severityCounts = {};

  alerts.forEach((alert) => {
    const roomId = alert.roomId || 'unknown';
    alertCounts[roomId] = (alertCounts[roomId] || 0) + 1;
    severityCounts[roomId] = {
      ...severityCounts[roomId],
      [alert.severity]: (severityCounts[roomId]?.[alert.severity] || 0) + 1,
    };
  });

  // Get max count for scaling
  const maxCount = Math.max(...Object.values(alertCounts), 5);

  // Get color based on alert intensity
  const getHeatColor = (count) => {
    const intensity = count / maxCount;
    if (intensity >= 0.8) return '#dc2626'; // Dark Red
    if (intensity >= 0.6) return '#ef4444'; // Red
    if (intensity >= 0.4) return '#f97316'; // Orange
    if (intensity >= 0.2) return '#eab308'; // Yellow
    return '#10b981'; // Green (no alerts)
  };

  const getHeatOpacity = (count) => {
    return Math.min(0.3 + (count / maxCount) * 0.7, 1);
  };

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
          {alerts.length} Active
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-5 gap-2">
        {rooms.map((room) => {
          const count = alertCounts[room.id] || 0;
          const severity = severityCounts[room.id];
          const heatColor = getHeatColor(count);
          const opacity = getHeatOpacity(count);

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              <div
                className="w-full aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all"
                style={{
                  backgroundColor: heatColor,
                  opacity: opacity,
                  borderColor: heatColor,
                }}
              >
                <span className="text-white drop-shadow">{count}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-gray-300">Alerts: {count}</div>
                  {severity && (
                    <>
                      {severity.CRITICAL && (
                        <div className="text-red-400">🔴 Critical: {severity.CRITICAL}</div>
                      )}
                      {severity.WARNING && (
                        <div className="text-yellow-400">🟡 Warning: {severity.WARNING}</div>
                      )}
                      {severity.INFO && (
                        <div className="text-blue-400">🔵 Info: {severity.INFO}</div>
                      )}
                    </>
                  )}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>

              {/* Room Label */}
              <div className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300 truncate">
                {room.name.split('-')[0]}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">None</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
