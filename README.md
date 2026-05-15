# 🏫 Campus Monitor

<div align="center">

![Campus Monitor Banner](https://img.shields.io/badge/Campus-Monitor-2563EB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMiA0YzEuMSAwIDIgLjkgMiAycy0uOSAyLTIgMi0yLS45LTItMiAuOS0yIDItMnptMCAxNmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDhDMTYuNzEgMTguNzIgMTQuNSAyMCAxMiAyMHoiLz48L3N2Zz4=)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**Real-time campus environment monitoring — temperature, air quality, and energy usage across every room, live.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Architecture](#-architecture)

</div>

---

## 📸 Overview

Campus Monitor is a full-stack web application that gives campus administrators and staff real-time visibility into environmental conditions across multiple rooms. It monitors temperature, air quality index (AQI), energy consumption, and occupancy — automatically raising alerts when anomalies are detected and providing AI-powered analysis of sensor readings.

Built for engineering colleges that want to move from reactive problem-solving to proactive campus management.

---

## ✨ Features

### 🔴 Real-Time Monitoring
- Live sensor data streamed via **Socket.IO** — no page refresh needed
- 8 rooms monitored simultaneously (labs, classrooms, offices, library, cafeteria)
- Updates every **3 seconds** per room
- Metrics: Temperature · AQI · Energy Usage (Watts) · Motion/Occupancy

### 🚨 Smart Alerting
- Automatic alert generation when thresholds are breached
- Four severity levels: `LOW` · `MEDIUM` · `HIGH` · `CRITICAL`
- **Email notifications** (via Nodemailer) for CRITICAL and HIGH alerts
- Alert resolution with audit trail

### 🤖 AI Anomaly Detection
- **Groq LLM** integration for intelligent anomaly reasoning
- Auto-generates explanations for unusual sensor patterns
- Broadcasts AI findings in real-time to connected clients
- Graceful fallback when AI service is unavailable

### 📊 Analytics Dashboard
- Historical charts for temperature, energy, and AQI trends
- Date range filtering (daily, weekly, monthly)
- Per-room and cross-room comparison views
- Aggregated statistics (min / max / avg)

### 🔐 Role-Based Access Control
| Role | Permissions |
|------|-------------|
| `admin` | Full access — user management, settings reset, all routes |
| `manager` | Alert resolution, data export, analytics |
| `viewer` | Read-only dashboard and monitoring |

### 📦 Additional Features
- **Data Export** — Download alerts as CSV or JSON
- **Audit Trail** — Every alert resolution and settings change is logged with IP, user agent, and before/after values (auto-deleted after 30 days)
- **Paginated Responses** — All list endpoints paginated (default: 15/page)
- **Persistent Settings** — Per-user settings stored in MongoDB with localStorage fallback
- **Standardized API Errors** — Zod validation with consistent error format across all endpoints

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT (HS256, 7-day expiry) |
| Validation | Zod |
| Email | Nodemailer |
| AI | Groq API |
| Rate Limiting | express-rate-limit |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Material UI |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key (optional — AI features degrade gracefully without it)

### 1. Clone the Repository
```bash
git clone https://github.com/RAKSHITH-CODR/Campus-Monitor.git
cd Campus-Monitor
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# AI (optional)
GROQ_API_KEY=your_groq_api_key

# Email (optional — uses test transporter by default)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=campus-monitor@yourdomain.com
```

Start the backend:
```bash
npm run dev
```

The server starts on `http://localhost:5000`. On startup it will:
- Connect to MongoDB and seed 8 sample rooms
- Start the sensor simulation engine (data every 3s)
- Start the anomaly injection engine (every 30s)
- Schedule background jobs (cleanup, analytics, monitoring)

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. First Login
Register a new account via `POST /api/auth/register`. The first admin account can be set by updating the user's role directly in MongoDB, or via the `/api/auth/users` endpoint once you have an admin token.

---

## 📡 API Reference

Base URL: `http://localhost:5000`

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/users` | Admin | List all users |
| `PATCH` | `/api/auth/users/:id/role` | Admin | Update user role |
| `DELETE` | `/api/auth/users/:id` | Admin | Delete user |

### Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/rooms` | ❌ | Get all rooms (paginated) |
| `GET` | `/api/rooms/:id` | ❌ | Get room by ID |
| `POST` | `/api/rooms` | Admin | Create room |
| `PATCH` | `/api/rooms/:id` | Admin | Update room |

### Sensors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/sensors/save` | ✅ | Save sensor reading |
| `GET` | `/api/sensors/live?room=Lab 1` | ❌ | Latest 10 readings |
| `GET` | `/api/sensors/history?room=Lab 1&days=7` | ❌ | Historical data |

### Alerts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/alerts` | ✅ | All alerts (paginated) |
| `GET` | `/api/alerts/active` | ✅ | Active alerts only |
| `PATCH` | `/api/alerts/:id/resolve` | Manager+ | Resolve an alert |
| `GET` | `/api/alerts/export?format=csv` | Manager+ | Export CSV or JSON |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/analytics/temperature?room=Lab 1` | ✅ | Temperature trends |
| `GET` | `/api/analytics/energy?room=Lab 1` | ✅ | Energy trends |
| `GET` | `/api/analytics/aqi?room=Lab 1` | ✅ | AQI trends |
| `GET` | `/api/analytics/statistics?room=Lab 1` | ✅ | Aggregated stats |

### Settings & Audit
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | ✅ | Get user settings |
| `PATCH` | `/api/settings` | ✅ | Update settings |
| `POST` | `/api/settings/reset` | Admin | Reset to defaults |
| `GET` | `/api/audit/my-logs` | ✅ | User's audit trail |
| `GET` | `/api/audit/:entity/:id` | ✅ | Entity audit logs |

### Socket.IO Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `sensorUpdate` | Server → Client | `{ room, temperature, aqi, energyUsage, motion, timestamp }` |
| `newAlert` | Server → Client | Alert object with severity and room |
| `aiReasoning` | Server → Client | AI analysis result |
| `analyticsUpdate` | Server → Client | Hourly aggregated statistics |
| `roomUpdate` | Server → Client | Room status change |

---

## 🏗 Architecture

```
Campus-Monitor/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/          # JWT auth, user management
│       │   ├── rooms/         # Room CRUD
│       │   ├── sensors/       # Sensor ingestion & retrieval
│       │   ├── alerts/        # Alert lifecycle
│       │   ├── analytics/     # Aggregation pipelines
│       │   ├── ai/            # Groq LLM integration
│       │   ├── settings/      # Per-user settings
│       │   └── audit/         # Audit trail
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── roleMiddleware.js
│       │   ├── pagination.js
│       │   └── errorMiddleware.js
│       ├── services/
│       │   ├── emailService.js
│       │   ├── exportService.js
│       │   ├── auditService.js
│       │   └── sensorEngine.js
│       ├── config/
│       │   └── env.js
│       └── app.js
│
└── frontend/
    └── src/
        ├── pages/             # LoginPage, Dashboard, Alerts, Analytics, etc.
        ├── components/        # Navbar, RoomCard, AlertCard, Charts
        ├── services/
        │   ├── api.js         # Axios API client
        │   └── socket.js      # Socket.IO client
        ├── hooks/             # useSocket, useApi, useAuth
        ├── store/             # Zustand global state
        └── App.jsx
```

### Background Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Sensor Engine | Every 3s | Simulates live sensor data, broadcasts via Socket.IO |
| Anomaly Engine | Every 30s | Injects test anomalies (temp 45°C, AQI 250+) |
| Monitoring Job | Every 5 min | Checks all rooms against thresholds, creates alerts |
| Analytics Job | Hourly | Computes and caches room statistics |
| Cleanup Job | Daily 2 AM | Deletes data older than 30 days |

---

## 📊 Database Schema

### Rooms
```js
{ name, type, floor, capacity, normalTemperature, maxTemperature, status }
```
Pre-seeded: Lab 1, Lab 2, Class A, Class B, Office 101, Office 102, Library, Cafeteria

### Sensors (TTL: 30 days)
```js
{ room, temperature, airQuality, energyUsage, motion, timestamp }
```

### Alerts (TTL: 30 days)
```js
{ room, severity, message, status, resolvedBy, resolvedAt, createdAt }
```
Severity enum: `LOW | MEDIUM | HIGH | CRITICAL`

### Users
```js
{ email, password (bcrypt), role: 'admin' | 'manager' | 'viewer', settings }
```

### AuditLogs (TTL: 30 days)
```js
{ action, entity, entityId, userId, changes: { before, after }, ipAddress, userAgent }
```

---

## 🔒 Security

- **Rate Limiting**: 100 req/15min standard, 5 req/15min on auth endpoints
- **JWT Auth**: HS256 signed, 7-day expiry
- **RBAC**: Three-tier role system enforced at middleware level
- **Input Validation**: Zod schemas on all controllers
- **Audit Logging**: All destructive actions logged with IP tracking
- **TTL Indexes**: Sensitive data auto-purged after 30 days

---

## 🛣 Roadmap

- [ ] WebSocket real-time dashboard (live room card updates without polling)
- [ ] Custom alert threshold rules per room
- [ ] Room comparison mode in analytics
- [ ] PDF export for analytics reports
- [ ] Notification bell with real-time unread alert feed
- [ ] Mobile app (React Native)
- [ ] Multi-tenant support

---

## 👥 Contributors

- **[RAKSHITH-CODR](https://github.com/RAKSHITH-CODR)** — Project Lead, Backend Architecture
- **[Chandranshu](https://github.com/)** — Feature Development, WebSocket Integration

---

## 📄 License

This project is for educational purposes. Feel free to fork and adapt for your institution.

---

<div align="center">
Built with ☕ during engineering college — because manual attendance sheets were just the beginning.
</div>
