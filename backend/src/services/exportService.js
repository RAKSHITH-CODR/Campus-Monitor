/**
 * Export Service
 * Converts data to CSV and JSON formats
 */

// Convert JSON array to CSV
const jsonToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  if (!headers) {
    headers = Object.keys(data[0]);
  }

  // Create CSV header row
  const csvHeaders = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma or newline
      value = String(value || '').replace(/"/g, '""');
      return `"${value}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

// Format data for export
const formatAlertsForExport = (alerts) => {
  return alerts.map(alert => ({
    'Alert ID': alert._id,
    'Room': alert.room,
    'Message': alert.message,
    'Severity': alert.severity,
    'Status': alert.status,
    'Created At': new Date(alert.createdAt).toLocaleString(),
    'Resolved At': alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A',
    'Temperature': alert.sensorData?.temperature || 'N/A',
    'Air Quality': alert.sensorData?.airQuality || 'N/A',
    'Energy Usage': alert.sensorData?.energyUsage || 'N/A',
  }));
};

const formatSensorDataForExport = (sensors) => {
  return sensors.map(sensor => ({
    'Room': sensor.room,
    'Temperature': sensor.temperature?.toFixed(2) || 'N/A',
    'Air Quality': sensor.airQuality || 'N/A',
    'Energy Usage': sensor.energyUsage || 'N/A',
    'Motion': sensor.motion ? 'Active' : 'Idle',
    'Timestamp': new Date(sensor.timestamp).toLocaleString(),
  }));
};

module.exports = {
  jsonToCSV,
  formatAlertsForExport,
  formatSensorDataForExport,
};
