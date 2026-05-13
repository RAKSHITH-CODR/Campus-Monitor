# Campus Monitor - Frontend Design Plan

**Status:** Ready for Development  
**Date:** May 9, 2026  
**Theme:** Professional, Modern, Balanced

---

## 🎨 Design System

### Color Palette
```
Primary Blue:     #2563EB (navbar, buttons, focus states)
Dark Blue:        #1E40AF (darker theme accents)
Cyan Accent:      #06B6D4 (charts, data visualization)
Success Green:    #10B981 (alerts resolved, positive data)
Warning Orange:   #F59E0B (caution alerts)
Danger Red:       #EF4444 (critical alerts)
Gray-50:          #F9FAFB (backgrounds, light)
Gray-900:         #111827 (text, dark mode bg)
Gray-800:         #1F2937 (secondary text light)
Gray-100:         #F3F4F6 (card backgrounds light)
```

### Typography
- **Font Family:** Inter/Poppins (Google Fonts)
- **Headings:** Poppins Bold (h1, h2, h3)
- **Body:** Inter Regular (default text)
- **Code/Data:** Monaco/Courier (sensor values, stats)

### Responsive Breakpoints
```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

---

## 🏗️ Layout Architecture

### Global Structure
```
┌─────────────────────────────────────┐
│  TOP NAVBAR (Fixed)                 │
│  Logo | Nav Items | Icons | Profile │
└─────────────────────────────────────┘
│                                     │
│  Main Content Area (Flexible)       │
│  - Full width on most pages         │
│  - Optional minimal sidebar (right) │
│  - Clean spacing, not crowded       │
│                                     │
│  [Optional Right Sidebar]           │
│  - Analytics filters/settings       │
│  - Collapsible for mobile           │
│                                     │
└─────────────────────────────────────┘
│  FOOTER (Minimal)                   │
│  Info | Links | Theme Toggle        │
└─────────────────────────────────────┘
```

### Navigation Strategy
- **Desktop:** Top navbar with dropdown menu + icons
- **Tablet:** Navbar with icons, dropdown on menu icon
- **Mobile:** Hamburger menu (collapse all to drawer)
- **No fixed sidebar** - clean, spacious design

---

## 📱 Navbar Design

### Components
1. **Left Section:**
   - Campus Monitor Logo/Brand
   - App title (visible on desktop only)

2. **Center/Right Section (Icons):**
   - Search bar (desktop only, mobile in drawer)
   - Notifications icon (bell with badge for active alerts)
   - Theme toggle (sun/moon icon)
   - User profile dropdown

3. **Navigation:**
   - Dropdown menu on large screens
   - Hamburger → Drawer on mobile
   - Breadcrumb for current page

### Navbar Items
```
- Dashboard
- Alerts
- Analytics
- Rooms
- Settings (if admin)
- Logout
```

---

## 🎯 Page Structure

### 1. **Login/Auth Page**
```
Full page layout (no navbar/footer)
┌─────────────────────┐
│                     │
│   Left Side:        │
│   - Branding        │
│   - Features list   │
│   - Testimonial     │
│                     │
│   Right Side:       │
│   - Login form      │
│   - Sign up link    │
│                     │
└─────────────────────┘
```
**Components:**
- Email input field (Material UI)
- Password field with show/hide toggle
- "Remember me" checkbox (shadcn)
- Login button (elevated, hover animation)
- Sign up link
- Forgot password link
- Error messages (animated entrance)

**Features:**
- Form validation with error states
- Loading state on button
- Smooth transitions
- Branding on left (split layout on desktop, single on mobile)

---

### 2. **Dashboard (Main Hub)**
```
┌─ Navbar ─────────────────────────────┐
├────────────────────────────────────────┤
│                                        │
│  Welcome Card (Greeting + Quick Stats) │
│                                        │
│  Grid Layout (Responsive):             │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ Room │  │ Room │  │ Room │        │
│  │Card  │  │Card  │  │Card  │        │
│  └──────┘  └──────┘  └──────┘        │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ Room │  │ Room │  │ Room │        │
│  │Card  │  │Card  │  │Card  │        │
│  └──────┘  └──────┘  └──────┘        │
│                                        │
│  Active Alerts Section (Mini-list)    │
│                                        │
│  Quick Stats Cards (3 cols)            │
│  ├─ Temperature Avg                   │
│  ├─ Energy Usage Total                │
│  └─ Alerts Count                      │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Welcome banner with user name + greeting
- Room cards (8 total, grid responsive to 2/3/4 cols)
  - Room name + type
  - Current temperature (with color code)
  - Alert count badge
  - Status indicator (Active/Inactive)
  - Hover effect: expand to show quick actions
- Active alerts mini-list (top 5)
- Statistics cards with small charts
- Framer Motion: card entrance animations, smooth hover

**Room Card Details:**
```
┌──────────────────────┐
│ Lab 1        [icon]  │ ← Type indicator
│ Floor 1 | 25/30 Cap  │
│                      │
│ 🌡️ 25.5°C ⚠️ (warn) │
│ 💨 AQI 65 ✓ (good)  │
│ ⚡ 345W                │
│                      │
│ Alerts: 2    →       │ ← Click to view room
└──────────────────────┘
```

---

### 3. **Alerts Center**
```
┌─ Navbar ──────────────────────────────┐
├────────────────────────────────────────┤
│ Alerts Center                          │
│                                        │
│ Filters (horizontal tabs):             │
│ [All] [Active] [Resolved] [High+]     │
│                                        │
│ Search / Sort dropdown                 │
│                                        │
│ Alerts List:                           │
│ ┌──────────────────────────────────┐  │
│ │ 🔴 CRITICAL - Lab 1              │  │
│ │ Temperature exceeds safe limits  │  │
│ │ 2 hours ago | Resolve | Details  │  │
│ └──────────────────────────────────┘  │
│ ┌──────────────────────────────────┐  │
│ │ 🟠 HIGH - Class A                │  │
│ │ Energy usage anomaly detected    │  │
│ │ 1 hour ago | Resolve | Details   │  │
│ └──────────────────────────────────┘  │
│ [More...] or pagination               │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Filter tabs (All, Active, Resolved, Critical)
- Search bar
- Alert list items (expandable)
  - Severity badge (color-coded: red/orange/yellow/blue)
  - Room name
  - Alert message
  - Timestamp (relative: "2 hours ago")
  - Action buttons (Resolve, Dismiss, View Details)
- Alert detail modal (expandable)
  - Full sensor data
  - Chart of readings
  - Resolve reason input
  - AI analysis (if available)

---

### 4. **Analytics Page**
```
┌─ Navbar ───────────────────────────────┐
├────────────────────────────────────────┤
│ Analytics                              │
│                                        │
│ [Filters - Right Sidebar]              │
│ Room selector dropdown                 │
│ Date range picker                      │
│                                        │
│ Main Content:                          │
│ ┌────────────────────────────────────┐│
│ │ Temperature Trend        [Options] ││
│ │ [Line Chart - 7 days]              ││
│ │ Avg: 24.5°C | Min: 20°C | Max: 30°C
│ └────────────────────────────────────┘│
│                                        │
│ ┌────────────────────────────────────┐│
│ │ Energy Consumption       [Options] ││
│ │ [Bar Chart - 7 days]               ││
│ │ Total: 2.4 kWh | Peak: 450W       ││
│ └────────────────────────────────────┘│
│                                        │
│ ┌────────────────────────────────────┐│
│ │ Air Quality Index        [Options] ││
│ │ [Area Chart - 7 days]              ││
│ │ Avg: 65 | Status: GOOD            ││
│ └────────────────────────────────────┘│
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Right sidebar: Room selector, date range, metric selector
- Chart grid (3 columns on desktop, stacked on mobile)
- Recharts for data visualization
  - Line charts (smooth, professional)
  - Bar charts (clean, readable)
  - Area charts (cumulative data)
- Summary stats below each chart
- Export button (CSV/PDF)
- Comparison mode (compare two rooms)

---

### 5. **Room Monitor (Detail View)**
```
┌─ Navbar ───────────────────────────────┐
├────────────────────────────────────────┤
│ Lab 1                    [← Back]       │
│                                        │
│ Status Card:                           │
│ ┌──────────────────────────────────┐  │
│ │ Status: ACTIVE                   │  │
│ │ Occupancy: 25/30 | Type: Lab    │  │
│ │ Floor 1 | Last Updated: 5 min ago│  │
│ └──────────────────────────────────┘  │
│                                        │
│ Real-time Metrics (3 cols):            │
│ ┌────────┐  ┌────────┐  ┌────────┐   │
│ │🌡️ Temp  │ │💨 AQI  │ │⚡ Energy│  │
│ │25.5°C   │ │65 Good │ │345W     │  │
│ └────────┘ └────────┘ └────────┘   │
│                                        │
│ Sensor History (24 hours):             │
│ ┌──────────────────────────────────┐  │
│ │ [Interactive Chart]              │  │
│ │ Temperature Over Time            │  │
│ └──────────────────────────────────┘  │
│                                        │
│ Related Alerts:                        │
│ [Alert 1] [Alert 2] [Alert 3]         │
│                                        │
│ AI Analysis (if available):            │
│ "No anomalies detected. All systems... │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Room header with status indicator
- Real-time metric cards (live data from WebSocket)
- Historical chart (24-hour sensor data)
- Related alerts mini-list
- AI analysis card (if analysis exists)
- Related actions button

---

## 🎬 Animation & Motion Plan

### Entrance Animations
- **Page Load:** Fade in + slight slide down (subtle)
- **Cards:** Stagger entrance on dashboard (0.1s delays)
- **Charts:** Scroll-triggered animation (draw path for line charts)

### Interaction Animations
- **Buttons:** Scale 1.02 on hover, shadow elevation
- **Cards:** Lift (shadow increase) + slight blur background on hover
- **Dropdown:** Smooth height animation + fade
- **Modals:** Fade in background + scale up card

### Transitions
- **Page Changes:** Fade between routes (not instant)
- **Theme Toggle:** Background color smooth transition (0.3s)
- **Chart Updates:** Smooth data point transitions

### Balance (Not Overdone)
- All animations: 200-400ms duration
- Easing: ease-in-out (smooth, professional)
- No bounce or elastic effects
- Subtle, purposeful motion

---

## 🛠️ Tech Stack

```
Frontend Framework:    React 18 + Vite
Component Library:     shadcn/ui + Material UI
Styling:              Tailwind CSS
State Management:     Zustand
API Client:           Axios
Real-time:            Socket.IO Client
Routing:              React Router v6
Data Visualization:   Recharts
Animations:           Framer Motion
Forms:                React Hook Form + Zod
Icons:                Lucide React
Date/Time:            date-fns
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── Dashboard/
│   │   │   ├── WelcomeBanner.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   └── QuickStats.jsx
│   │   ├── Alerts/
│   │   │   ├── AlertList.jsx
│   │   │   ├── AlertCard.jsx
│   │   │   └── AlertFilters.jsx
│   │   ├── Analytics/
│   │   │   ├── ChartCard.jsx
│   │   │   ├── DateRangePicker.jsx
│   │   │   └── RoomSelector.jsx
│   │   ├── RoomMonitor/
│   │   │   ├── RoomHeader.jsx
│   │   │   ├── MetricsGrid.jsx
│   │   │   └── RoomChart.jsx
│   │   └── Common/
│   │       ├── Badge.jsx
│   │       ├── Loading.jsx
│   │       └── ErrorBoundary.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AlertsPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── RoomDetailPage.jsx
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useSocket.js
│   │   ├── useApi.js
│   │   └── useAuth.js
│   ├── services/
│   │   ├── api.js
│   │   ├── socket.js
│   │   └── storage.js
│   ├── store/
│   │   └── useStore.js (Zustand)
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── colors.js
│   ├── theme/
│   │   ├── colors.js
│   │   └── animations.js
│   └── App.jsx
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Build Phases

### Phase 1: Foundation (Setup + Login)
1. Create Vite project
2. Install all dependencies
3. Configure Tailwind + shadcn/ui
4. Build Navbar component
5. Build Login page
6. Setup routing & auth context

### Phase 2: Dashboard & Core Pages
1. Build Dashboard page with room cards
2. Build Alerts page with filters
3. Build Analytics page with charts
4. Build Room Monitor page

### Phase 3: Refinements
1. WebSocket integration
2. Real-time data updates
3. Dark mode implementation
4. Mobile responsiveness testing
5. Animation polish
6. Error handling & loading states

---

## 🎓 Design Philosophy

**"Professional, Not Flashy"**
- Clean spacing and hierarchy
- Purposeful animations (enhance, not distract)
- Consistent use of color (blue primary, red/orange for alerts)
- Readable typography with proper contrast
- Dark mode support (professional choice for dashboards)
- Everything accessible and usable, nothing crowded
- Modern but timeless (avoid trendy patterns)

---

## ✅ Ready to Build?

This plan covers:
- ✅ Color scheme and typography
- ✅ Layout architecture (no fixed sidebar, nav-driven)
- ✅ All 5 pages with detailed specs
- ✅ Animation guidelines (balanced, professional)
- ✅ Tech stack and project structure
- ✅ Build phases

**Next Step:** Set up the Vite React project with all dependencies and start building Phase 1.

Should I proceed?
