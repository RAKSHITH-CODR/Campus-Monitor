# Campus Monitor - Frontend Development Guide

## Backend Status: ✅ FULLY OPERATIONAL

Backend is running on `http://localhost:5000` with all 15+ endpoints tested and working.

---

## Quick Start for Frontend

### Prerequisites
- Node.js 18+
- npm/yarn
- React 18+ with Vite

### Backend API Base URL
```
http://localhost:5000
```

### WebSocket Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join a room
socket.emit('join', { room: 'Lab 1' });

// Listen for real-time updates
socket.on('sensorUpdate', (data) => console.log('Sensor:', data));
socket.on('newAlert', (alert) => console.log('Alert:', alert));
socket.on('aiReasoning', (analysis) => console.log('AI:', analysis));
socket.on('analyticsUpdate', (stats) => console.log('Stats:', stats));
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Get JWT token |

**Register/Login Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "email": "user@campus.edu",
    "role": "viewer|admin|manager"
  }
}
```

### Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rooms` | ❌ | Get all rooms |
| GET | `/api/rooms/:id` | ❌ | Get specific room |
| POST | `/api/rooms` | ✅ | Create room |
| PATCH | `/api/rooms/:id` | ✅ | Update room |

**Sample Rooms:**
- Lab 1, Lab 2 (floor 1, capacity 30)
- Class A, Class B (floor 2, capacity 50)
- Office 101, Office 102 (floor 1, capacity 2-3)
- Library (floor 3, capacity 100)
- Cafeteria (floor 1, capacity 200)

### Sensors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/sensors/save` | ✅ | Save new reading |
| GET | `/api/sensors/live?room=Lab%201` | ❌ | Get latest 10 readings |
| GET | `/api/sensors/history?room=Lab%201&days=7` | ❌ | Get historical data |

**Sensor Save Payload:**
```json
{
  "room": "Lab 1",
  "temperature": 25.5,
  "motion": true,
  "airQuality": 65,
  "energyUsage": 350
}
```

**Sensor Data Response:**
```json
{
  "_id": "...",
  "room": "Lab 1",
  "temperature": 25.5,
  "motion": true,
  "airQuality": 65,
  "energyUsage": 350,
  "timestamp": "2026-05-08T17:45:00.000Z"
}
```

### Alerts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/alerts` | ❌ | Get all alerts |
| GET | `/api/alerts/active` | ❌ | Get active only |
| PATCH | `/api/alerts/:id/resolve` | ✅ | Resolve alert |

**Alert Response:**
```json
{
  "_id": "...",
  "room": "Lab 1",
  "message": "Temperature exceeds safe limits",
  "severity": "HIGH",
  "status": "ACTIVE|RESOLVED|ACKNOWLEDGED",
  "sensorData": {...},
  "createdAt": "2026-05-08T17:45:00.000Z"
}
```

**Severity Levels:**
- `LOW` - Minor threshold violations
- `MEDIUM` - Moderate concerns
- `HIGH` - Significant issues
- `CRITICAL` - Immediate action needed

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/temperature?room=Lab%201` | ❌ | Temperature trends |
| GET | `/api/analytics/energy?room=Lab%201` | ❌ | Energy consumption |
| GET | `/api/analytics/aqi?room=Lab%201` | ❌ | Air quality trends |
| GET | `/api/analytics/statistics?room=Lab%201` | ❌ | Aggregated stats |

**Analytics Response (Example):**
```json
{
  "room": "Lab 1",
  "data": [
    {
      "timestamp": "2026-05-08T17:00:00.000Z",
      "value": 24.5,
      "average": 24.2,
      "min": 23.1,
      "max": 25.8,
      "count": 100
    }
  ]
}
```

### AI Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyze` | ✅ | Analyze anomalies |

**Request:**
```json
{
  "room": "Lab 1"
}
```

**Response:**
```json
{
  "room": "Lab 1",
  "sensorData": {...},
  "reasoning": "AI analysis from Groq LLM...",
  "actionTaken": "ALERT|NONE",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "timestamp": "2026-05-08T17:45:00.000Z"
}
```

---

## Authentication Pattern

### Get Token
```javascript
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testuser@campus.edu',
    password: 'Password123'
  })
});

const { token } = await loginResponse.json();
```

### Use Token on Protected Endpoints
```javascript
const response = await fetch('http://localhost:5000/api/sensors/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    room: 'Lab 1',
    temperature: 25.5,
    motion: true,
    airQuality: 65,
    energyUsage: 350
  })
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "room parameter required"
}
```

### 401 Unauthorized
```json
{
  "error": "token required"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details here"
}
```

---

## Data Range Values

### Temperature
- **Normal Range:** 20-28°C
- **Warning Range:** 28-35°C
- **Critical Range:** >35°C

### Air Quality (AQI)
- **Good:** 0-50
- **Moderate:** 51-100
- **Unhealthy:** 101-200
- **Hazardous:** >200

### Energy Usage
- **Normal Range:** 200-500W
- **Warning Range:** 500-750W
- **Critical Range:** >750W

---

## Real-Time Data Generation

The backend continuously generates:
- ✅ Sensor readings every 3 seconds per room
- ✅ Anomalies every 30 seconds (random room)
- ✅ Analytics aggregation every hour
- ✅ Threshold monitoring every 5 minutes

Perfect for testing real-time UI updates!

---

## Console Logging Strategy

### Backend (Current)
- ✅ Clean startup messages only
- ✅ No operational logs during runtime
- ✅ Errors logged only when they occur

### Frontend (To Implement)
- 📝 Audit logs for all user actions
- 📝 Data operations tracking
- 📝 Analytics event logging
- 📝 Error tracking and reporting

---

## Frontend Project Setup

```bash
# Create Vite React project
npm create vite@latest campus-monitor-frontend -- --template react

# Install dependencies
cd campus-monitor-frontend
npm install

# Add required packages
npm install axios socket.io-client recharts date-fns zustand

# Start dev server
npm run dev
```

---

## Recommended Frontend Structure

```
src/
├── components/
│   ├── Dashboard/
│   ├── RoomMonitor/
│   ├── AlertCenter/
│   ├── Analytics/
│   └── Common/
├── hooks/
│   ├── useSocket.js
│   ├── useApi.js
│   └── useAuth.js
├── services/
│   ├── api.js
│   ├── socket.js
│   └── auth.js
├── store/
│   └── useStore.js (Zustand)
├── pages/
│   ├── Login
│   ├── Dashboard
│   └── Analytics
└── App.jsx
```

---

## Key Features to Build

1. **Authentication**
   - Login page with JWT token storage
   - Protected routes
   - Logout functionality

2. **Dashboard**
   - Real-time sensor data cards
   - Active alerts display
   - Room status overview
   - WebSocket integration

3. **Alert Center**
   - Alert list with filtering
   - Severity indicators
   - Resolve/acknowledge actions
   - Alert history

4. **Analytics View**
   - Temperature trends chart
   - Energy consumption graph
   - AQI trends
   - Custom date range selection

5. **Room Monitor**
   - Per-room detailed view
   - Sensor readings with history
   - Anomaly alerts
   - Actions (create manual alerts, etc.)

---

## Testing Checklist

- [ ] API connectivity test
- [ ] WebSocket real-time updates
- [ ] Authentication flow (login/logout)
- [ ] Room data loading
- [ ] Sensor data display (live + history)
- [ ] Alert filtering and resolution
- [ ] Analytics charting
- [ ] Error handling (invalid inputs, no connection, etc.)
- [ ] Rate limiting behavior
- [ ] Audit logging

---

## Environment Variables

Create `.env.local` in frontend:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Access in code:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

---

## Performance Considerations

1. **Socket.IO:** 
   - Join specific room channels to reduce message volume
   - Implement efficient data updates (use timestamps to detect changes)

2. **API Calls:**
   - Cache room list (rarely changes)
   - Pagination for alert/sensor history
   - Debounce analytics requests

3. **UI Rendering:**
   - Use React.memo for chart components
   - Virtual scrolling for long alert lists
   - Memoize socket handlers

---

## Ready to Start! 🚀

Backend is fully tested and operational. Frontend can begin development immediately!

Start with the authentication page, then build the dashboard, and finally add analytics features.

Good luck! 💪
