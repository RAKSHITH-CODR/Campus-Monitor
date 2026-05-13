// Color utilities and theme colors
export const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#2563eb',
    600: '#1e40af',
    700: '#1d3557',
    900: '#0f172a',
  },

  // Accent colors
  accent: {
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
  },

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    critical: '#dc2626',
    info: '#3b82f6',
  },

  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark mode
  dark: {
    bg: '#111827',
    card: '#1f2937',
    border: '#374151',
  },
};

// Get color for severity level
export const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return colors.status.critical;
    case 'HIGH':
      return colors.status.danger;
    case 'MEDIUM':
      return colors.status.warning;
    case 'LOW':
      return colors.status.info;
    default:
      return colors.gray[500];
  }
};

// Get badge class for severity
export const getSeverityBadgeClass = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'badge-danger';
    case 'HIGH':
      return 'badge-danger';
    case 'MEDIUM':
      return 'badge-warning';
    case 'LOW':
      return 'badge-info';
    default:
      return 'badge-info';
  }
};

// Get status indicator color
export const getStatusColor = (status) => {
  if (status === 'ACTIVE' || status === 'active') {
    return colors.status.success;
  }
  if (status === 'RESOLVED') {
    return colors.gray[400];
  }
  if (status === 'ACKNOWLEDGED') {
    return colors.status.warning;
  }
  return colors.gray[400];
};

// AQI level colors
export const getAQIColor = (aqi) => {
  if (aqi < 50) return colors.status.success;
  if (aqi < 100) return colors.status.info;
  if (aqi < 200) return colors.status.warning;
  return colors.status.danger;
};

// Temperature status
export const getTemperatureStatus = (temp, normal = 24, max = 35) => {
  if (temp <= normal) return { color: colors.status.success, status: 'Normal' };
  if (temp < max) return { color: colors.status.warning, status: 'Warning' };
  return { color: colors.status.danger, status: 'Critical' };
};
