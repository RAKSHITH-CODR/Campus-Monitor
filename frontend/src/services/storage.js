// Local Storage utilities
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'app_theme',
};

// Token validation - check if token is not expired
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 > Date.now() : true;
  } catch (e) {
    return false;
  }
};

export const storage = {
  // Auth
  setAuth: (token, user) => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  },

  getAuth: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    // Validate token before returning
    if (token && isTokenValid(token)) {
      return {
        token,
        user: user ? JSON.parse(user) : null,
      };
    }
    
    // Clear invalid token
    if (token) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    
    return { token: null, user: null };
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token && isTokenValid(token);
  },

  // Theme
  setTheme: (theme) => {
    if (theme === 'dark' || theme === 'light') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },
  getTheme: () => {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme === 'dark' || theme === 'light') ? theme : 'light';
  },
};
