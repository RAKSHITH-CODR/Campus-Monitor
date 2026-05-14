/**
 * Advanced Health Score Gauge Component
 * Radial gauge visualization for room health metrics
 */

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function HealthScoreGauge({ score = 75, size = 120 }) {
  // Determine color based on score
  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981'; // Green
    if (s >= 60) return '#f59e0b'; // Orange
    if (s >= 40) return '#ef4444'; // Red
    return '#dc2626'; // Dark Red
  };

  // Determine status text
  const getScoreStatus = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 80) return 'Good';
    if (s >= 70) return 'Fair';
    if (s >= 50) return 'Poor';
    return 'Critical';
  };

  const scoreColor = getScoreColor(score);
  const scoreStatus = getScoreStatus(score);

  // Gauge segments
  const segments = Array.from({ length: 10 }, (_, i) => ({
    angle: i * 36,
    radius: 100,
  }));

  // Circumference for progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circular Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke="rgba(107, 114, 128, 0.2)"
            strokeWidth="4"
          />

          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            fill="none"
            stroke={scoreColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-2xl font-bold" style={{ color: scoreColor }}>
              {score}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Health</div>
          </motion.div>
        </div>
      </div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 px-3 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: scoreColor }}
      >
        {scoreStatus}
      </motion.div>

      {/* Score indicators */}
      <div className="mt-4 space-y-2 w-full">
        {[
          { label: 'Safety', value: Math.min(100, score + Math.random() * 20) },
          { label: 'Comfort', value: score },
          { label: 'Efficiency', value: Math.max(0, score - Math.random() * 15) },
        ].map((indicator, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-600 dark:text-gray-400">{indicator.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${indicator.value}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                />
              </div>
              <span className="w-8 text-right font-medium">{Math.round(indicator.value)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
