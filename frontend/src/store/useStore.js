import { create } from 'zustand';
import { storage } from '../services/storage';

// Initialize auth state
const initAuthState = () => {
  const auth = storage.getAuth();
  return {
    auth,
    isAuthenticated: !!auth.token,
  };
};

export const useStore = create((set, get) => {
  const initialAuth = initAuthState();

  // Token sync across tabs/windows
  const handleStorageChange = (e) => {
    if (e.key === 'auth_token' || e.key === 'user_data') {
      const newAuth = storage.getAuth();
      set({ auth: newAuth, isAuthenticated: !!newAuth.token });
    }
    if (e.key === 'theme') {
      const theme = storage.getTheme();
      set({ theme });
    }
  };

  // Listen for storage changes from other tabs
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  // Check token expiration periodically (every 30 seconds)
  const checkTokenExpiration = () => {
    const state = get();
    if (state.isAuthenticated) {
      const auth = storage.getAuth();
      if (!auth.token) {
        set({ auth: { token: null, user: null }, isAuthenticated: false });
      }
    }
  };

  if (typeof window !== 'undefined') {
    setInterval(checkTokenExpiration, 30000);
  }

  return {
    // Auth state
    auth: initialAuth.auth,
    isAuthenticated: initialAuth.isAuthenticated,

    setAuth: (token, user) => {
      storage.setAuth(token, user);
      set({ auth: { token, user }, isAuthenticated: true });
    },

    logout: () => {
      storage.clearAuth();
      set({ auth: { token: null, user: null }, isAuthenticated: false });
    },

    // Theme state
    theme: storage.getTheme(),

    setTheme: (theme) => {
      if (theme !== 'dark' && theme !== 'light') return;
      storage.setTheme(theme);
      set({ theme });
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        storage.setTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      });
    },

    // Real-time data state
    latestSensors: {},
    alerts: [],
    rooms: [],

    setSensors: (sensors) => set({ latestSensors: sensors }),
    setAlerts: (alerts) => set({ alerts }),
    setRooms: (rooms) => set({ rooms }),

    updateAlert: (alertId, updates) => {
      set((state) => ({
        alerts: state.alerts.map((a) => (a._id === alertId ? { ...a, ...updates } : a)),
      }));
    },

    addAlert: (alert) => {
      set((state) => {
        // Prevent duplicates
        const exists = state.alerts.some((a) => a._id === alert._id);
        if (exists) return state;
        return {
          alerts: [alert, ...state.alerts],
        };
      });
    },

    // UI state
    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    // Loading state
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),

    // Error state
    error: null,
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  };
});
