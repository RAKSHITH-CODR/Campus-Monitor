# 📁 BACKEND FILE STRUCTURE & PURPOSES

## 🎯 Quick Navigation

### Configuration Files
```
├── .env                         ← DATABASE & API KEYS (EDIT THIS!)
├── package.json                 ← Dependencies & scripts
└── QUICK_START.md              ← Start here for setup
```

### Core Application
```
src/
├── server.js                    ← 🔴 Entry point - starts everything
├── app.js                       ← Express app configuration
│
├── config/
│   ├── env.js                  ← Environment variables manager
│   ├── db.js                   ← MongoDB connection
│   └── socket.js               ← Socket.IO initialization
```

### API Modules (Feature-Based)
```
src/modules/
│
├── auth/                        ← 🔐 User authentication
│   ├── user.model.js           ├─ Database schema
│   ├── auth.controller.js      ├─ Login/Register logic
│   └── auth.routes.js          └─ /api/auth endpoints
│
├── sensors/                     ← 📡 Sensor data endpoints
│   ├── sensor.model.js         ├─ Database schema (TTL: 30 days)
│   ├── sensor.controller.js    ├─ Save/Get logic (NOW BROADCASTS!)
│   └── sensor.routes.js        └─ /api/sensors endpoints
│
├── alerts/                      ← 🚨 Alert management
│   ├── alert.model.js          ├─ Database schema (TTL: 30 days)
│   ├── alert.controller.js     ├─ Alert CRUD
│   └── alert.routes.js         └─ /api/alerts endpoints
│
├── rooms/                       ← 🏫 Room management
│   ├── room.model.js           ├─ Database schema
│   ├── room.controller.js      ├─ Room CRUD
│   └── room.routes.js          └─ /api/rooms endpoints
│
├── analytics/                   ← 📊 Data analytics
│   ├── analytics.controller.js ├─ Trends & statistics
│   └── analytics.routes.js     └─ /api/analytics endpoints
│
└── ai/                          ← 🤖 AI with Groq
    ├── aiLog.model.js          ├─ AI reasoning storage (TTL: 30 days)
    ├── ai.controller.js        ├─ Groq API integration
    └── ai.routes.js            └─ /api/ai endpoints
```

### Business Logic (Services Layer)
```
src/services/
├── aiService.js                 ← Groq LLM integration, NOW BROADCASTS!
├── alertService.js              ← Alert creation & retrieval
├── socketService.js             ← 🔌 WebSocket broadcasting (HUB!)
├── analyticsService.js          ← Statistics calculations
└── monitoringService.js         ← Threshold checking
```

### Real-Time (Socket.IO)
```
src/sockets/
├── sensor.socket.js             ← Room subscriptions for sensors
├── alert.socket.js              ← Alert channel subscriptions
└── dashboard.socket.js          ← Dashboard client connections
```

### Background Tasks
```
src/jobs/
├── cleanup.job.js               ← Delete data > 30 days (Daily 2 AM)
├── analytics.job.js             ← Aggregate stats (Hourly) NOW BROADCASTS!
└── monitoring.job.js            ← Check thresholds (Every 5 min) NOW BROADCASTS!
```

### Data Generators (Testing)
```
src/simulator/
├── sensorEngine.js              ← Generates realistic data, NOW BROADCASTS!
├── anomalyEngine.js             ← Injects test anomalies, NOW BROADCASTS!
└── roomProfiles.js              ← 10 pre-configured rooms
```

### Middleware & Utilities
```
src/middleware/
├── authMiddleware.js            ← JWT validation
├── errorMiddleware.js           ← Error handler (WITH Zod support!)
└── rateLimiter.js               ← Rate limiting (IPv6-safe)

src/utils/
├── logger.js                    ← Console logging helpers
├── thresholds.js                ← Sensor thresholds config
└── severityCalculator.js        ← Alert severity logic
```

---

## 📊 DATA FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    🏫 CAMPUS MONITOR FLOW                    │
└─────────────────────────────────────────────────────────────┘

USER/CLIENT
    ↓
    ├─→ [POST /api/auth/login]
    │        ↓
    │    📌 Get JWT Token
    │        ↓
    │    Store in localStorage
    │        ↓
    │
    ├─→ [Socket Connection]
    │        ↓
    │    io.connect('http://localhost:5000')
    │        ↓
    │    socket.emit('subscribe_room', 'Lab 1')
    │        ↓
    │    Listen on 'sensorUpdate', 'newAlert', etc
    │
    └─→ [Get Sensor Data]
             ↓
        GET /api/sensors/live?room=Lab%201
             ↓
        Display readings

═══════════════════════════════════════════════════════════════

BACKEND PROCESSES
    ↓
    ├─→ 🔴 Sensor Engine (Every 3 seconds)
    │        ↓
    │    Generate realistic data
    │        ↓
    │    Save to MongoDB
    │        ↓
    │    ✨ BROADCAST via Socket.IO
    │        ↓
    │    Frontend receives 'sensorUpdate'
    │
    ├─→ 🔥 Anomaly Engine (Every 30 seconds)
    │        ↓
    │    Inject anomalous values
    │        ↓
    │    Save to MongoDB
    │        ↓
    │    ✨ BROADCAST via Socket.IO
    │        ↓
    │    Triggers alert system
    │
    ├─→ 🚨 Monitoring Job (Every 5 minutes)
    │        ↓
    │    Check all sensor thresholds
    │        ↓
    │    Create Alert if violation
    │        ↓
    │    ✨ BROADCAST via Socket.IO
    │        ↓
    │    Frontend receives 'newAlert'
    │
    ├─→ 📊 Analytics Job (Every hour)
    │        ↓
    │    Aggregate room statistics
    │        ↓
    │    Calculate trends
    │        ↓
    │    ✨ BROADCAST via Socket.IO
    │        ↓
    │    Frontend receives 'analyticsUpdate'
    │
    └─→ 🤖 AI Analysis (On demand)
             ↓
        Receive anomaly from sensor
             ↓
        Call Groq LLM
             ↓
        Get reasoning & action
             ↓
        Store AI Log
             ↓
        ✨ BROADCAST via Socket.IO
             ↓
        Frontend receives 'aiReasoning'
```

---

## 🔌 SOCKET.IO EVENTS

### Events Backend EMITS (to Frontend)
```
'sensorUpdate'      ← New sensor reading
'roomUpdate'        ← Room-specific sensor update
'newAlert'          ← New alert created
'aiReasoning'       ← AI analysis result
'analyticsUpdate'   ← Hourly statistics
'live_data_response' ← Response to live data request
```

### Events Backend LISTENS (from Frontend)
```
'subscribe_room'    → Join room broadcasts
'unsubscribe_room'  → Leave room broadcasts
'subscribe_alerts'  → Join alerts channel
'unsubscribe_alerts' → Leave alerts channel
'request_live_data' → Request current data
'disconnect'        → Client disconnected
'connection'        → New client connected
```

---

## 🗄️ DATABASE COLLECTIONS

```
mongodb://atlas/campus-monitor/
│
├─ sensors               (TTL: 30 days)
│  └─ Index: {room: 1, timestamp: -1}
│
├─ alerts               (TTL: 30 days)
│  ├─ Index: {room: 1, createdAt: -1}
│  └─ Index: {severity: 1, status: 1}
│
├─ ai_logs             (TTL: 30 days)
│  └─ Index: {room: 1, createdAt: -1}
│
├─ rooms               (No TTL - Reference data)
│  └─ Index: {name: 1} (unique)
│
└─ users               (No TTL - User accounts)
   └─ Index: {email: 1} (unique)
```

---

## 🔄 REQUEST FLOW EXAMPLE

### API Request + WebSocket Response

```javascript
// Frontend sends request
fetch('POST /api/sensors/save', {
  body: {room: 'Lab 1', temperature: 25, ...}
})

// Backend:
1. sensorController.saveSensorData()
   ↓
2. Validate with Zod schema
   ↓
3. Save to MongoDB
   ↓
4. broadcastSensorData(sensor)  ← NEW!
   ↓
5. socketService.js gets io instance
   ↓
6. io.emit('sensorUpdate', sensor)
   ↓
7. io.to(`room_Lab_1`).emit('roomUpdate', sensor)

// Frontend:
socket.on('sensorUpdate', (data) => {
  // Update UI immediately!
})
```

---

## ✅ ALL FILES VERIFIED

- ✅ server.js - Entry point working
- ✅ app.js - Express configured correctly
- ✅ All models - Schemas with proper indexes
- ✅ All controllers - Request handling complete
- ✅ All routes - Endpoints defined
- ✅ All services - Business logic implemented
- ✅ All sockets - Event handlers active
- ✅ All jobs - Scheduled and working
- ✅ All middleware - Validation & error handling
- ✅ Simulator - Data generation active

---

## 🚀 READY TO START

Everything is connected and working:
1. Sensors save → broadcast immediately ✅
2. Anomalies detected → broadcast immediately ✅
3. Alerts created → broadcast immediately ✅
4. Analytics generated → broadcast immediately ✅
5. AI analysis done → broadcast immediately ✅

**Backend is fully operational!**

---

## 📚 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| QUICK_START.md | Fast 5-minute setup |
| BACKEND_SETUP.md | Complete setup guide |
| IMPLEMENTATION_SUMMARY.md | Technical overview |
| FIXES_APPLIED.md | What was fixed today |
| READY_TO_RUN.md | Verification checklist |
| FILE_STRUCTURE.md | This file |

**Pick one based on your needs!** 🎯

---

## 🎉 YOU'RE READY TO GO!

```bash
npm start
# That's it! Everything starts automatically.
```

Backend will:
- ✅ Connect to MongoDB
- ✅ Seed sample data
- ✅ Start simulator engines
- ✅ Schedule background jobs
- ✅ Listen on port 5000
- ✅ Broadcast real-time updates

Happy coding! 🚀
