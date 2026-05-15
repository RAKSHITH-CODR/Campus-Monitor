import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { connectSocket, disconnectSocket } from './services/socket';
import { scenarioManager } from './services/scenarioManager';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import RoomDetailPage from './pages/RoomDetailPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import SimulationControlCenter from './components/SimulationControlCenter';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, auth } = useStore();
  return isAuthenticated && auth.user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { theme, isAuthenticated } = useStore();

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize Socket.IO on auth and cleanup on logout
  useEffect(() => {
    if (isAuthenticated) {
      try {
        connectSocket();
      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
      }
    } else {
      disconnectSocket();
    }

    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated]);

  const handleScenarioTrigger = (scenario) => {
    scenarioManager.triggerScenario(scenario);
    console.log('Scenario triggered:', scenario.id);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
          {isAuthenticated && <Navbar />}

          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysisPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="/room/:id" element={<ProtectedRoute><RoomDetailPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          {isAuthenticated && <Footer />}
          {isAuthenticated && <ChatbotWidget />}
          {isAuthenticated && <SimulationControlCenter onScenarioTrigger={handleScenarioTrigger} />}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
