// Formatting utilities
export const formatters = {
  // Relative time (e.g., "2 hours ago")
  timeAgo: (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  },

  // Temperature
  temperature: (temp) => `${temp.toFixed(1)}°C`,

  // Percentage
  percentage: (value, max) => `${Math.round((value / max) * 100)}%`,

  // Energy
  energy: (watts) => {
    if (watts >= 1000) return `${(watts / 1000).toFixed(2)} kW`;
    return `${watts.toFixed(0)} W`;
  },

  // Number formatting
  number: (num) => num.toLocaleString('en-US', { maximumFractionDigits: 2 }),

  // Date/Time
  date: (date) => new Date(date).toLocaleDateString(),
  time: (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  dateTime: (date) => new Date(date).toLocaleString(),

  // Capitalize
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
};

export default formatters;
