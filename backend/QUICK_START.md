# 🚀 QUICK START GUIDE

## Prerequisites
- Node.js installed
- MongoDB Atlas account (free tier works)
- Groq API key (free)

## 1️⃣ Configure Environment

Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-monitor?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_random_jwt_secret_here
```

## 2️⃣ Start Backend

```bash
cd backend
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║  🏫 CAMPUS MONITOR BACKEND              ║
║  📡 Server running on port: 5000         ║
║  🌍 Frontend: http://localhost:5173      ║
║  🗄️  Database: Connected                ║
╚════════════════════════════════════════╝
```

## 3️⃣ Test Backend

### Health Check
```bash
curl http://localhost:5000/health
```

### Create User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@campus.edu","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@campus.edu","password":"password123"}'
```

### Get Rooms
```bash
curl http://localhost:5000/api/rooms
```

### Get Live Sensor Data
```bash
curl "http://localhost:5000/api/sensors/live?room=Lab%201"
```

## ✨ Features Working

✅ Real-time sensor data generation (every 3 seconds)
✅ Automatic anomaly injection (every 30 seconds)
✅ Live alerts via WebSocket
✅ AI analysis with Groq
✅ Background monitoring jobs
✅ Analytics aggregation
✅ Complete REST API

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure username/password are correct

### Groq API Error
- Verify API key in `.env`
- Check Groq console for rate limits
- Ensure API key has proper permissions

### Port 5000 Already In Use
- Change PORT in `.env` to different port
- Or kill existing process:
  ```bash
  lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
  ```

## 📊 What's Running

### Background Jobs
- ✅ **Cleanup Job** - Deletes data older than 30 days (daily at 2 AM)
- ✅ **Analytics Job** - Aggregates room statistics (hourly)
- ✅ **Monitoring Job** - Checks thresholds and creates alerts (every 5 min)

### Simulator Engines
- ✅ **Sensor Engine** - Generates realistic data every 3 seconds
- ✅ **Anomaly Engine** - Injects test anomalies every 30 seconds

### Real-Time Updates
- ✅ **Socket.IO** - Live data streaming to frontend
- ✅ **WebSocket Rooms** - Subscribe to specific room updates

## 🎯 Next Steps

1. Connect your React frontend to `http://localhost:5000`
2. Subscribe to Socket.IO events for real-time updates
3. Start using the APIs to build your dashboard

## 📚 API Documentation

### Auth Endpoints
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login & get JWT token
```

### Sensor Endpoints
```
POST /api/sensors/save    - Submit sensor data
GET  /api/sensors/live    - Get latest readings
GET  /api/sensors/history - Get historical data
```

### Alert Endpoints
```
GET  /api/alerts          - Get all alerts
GET  /api/alerts/active   - Get active alerts only
PATCH /api/alerts/:id/resolve - Mark alert as resolved
```

### Room Endpoints
```
GET  /api/rooms           - Get all rooms
POST /api/rooms           - Create new room
GET  /api/rooms/:id       - Get room details
PATCH /api/rooms/:id      - Update room
```

### Analytics Endpoints
```
GET /api/analytics/temperature   - Temperature trends
GET /api/analytics/energy        - Energy usage trends
GET /api/analytics/aqi           - Air quality trends
GET /api/analytics/statistics    - Room statistics
```

### AI Endpoints
```
POST /api/ai/analyze      - Analyze anomalies (requires JWT)
```

## 🔌 Socket.IO Events

### Subscribe to Updates (From Frontend)
```javascript
socket.emit('subscribe_room', 'Lab 1');
socket.emit('subscribe_alerts');
```

### Receive Updates (On Frontend)
```javascript
socket.on('sensorUpdate', (data) => {...});
socket.on('roomUpdate', (data) => {...});
socket.on('newAlert', (alert) => {...});
socket.on('aiReasoning', (analysis) => {...});
```

## ✅ Backend is Production Ready!

All critical features implemented:
- ✅ Authentication & JWT
- ✅ Input validation (Zod)
- ✅ Error handling
- ✅ Rate limiting
- ✅ Real-time WebSocket
- ✅ Background jobs
- ✅ AI integration
- ✅ Database optimization

**Enjoy building! 🎉**
