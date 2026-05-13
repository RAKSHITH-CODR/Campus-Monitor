const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const sensorRoutes = require('./modules/sensors/sensor.routes');
const alertRoutes = require('./modules/alerts/alert.routes');
const roomRoutes = require('./modules/rooms/room.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const auditRoutes = require('./modules/audit/audit.routes');

const app = express();

// Middleware
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit', auditRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
