/**
 * Unified Theme Configuration
 * Ensures consistent light/dark mode across entire app
 */

export const THEME_COLORS = {
  light: {
    // Backgrounds
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F0F2F5',
      hover: '#E8EAED',
    },
    // Text
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
      tertiary: '#9A9A9A',
      inverse: '#FFFFFF',
    },
    // Borders
    border: {
      primary: '#E0E0E0',
      secondary: '#D0D0D0',
    },
    // Components
    card: '#FFFFFF',
    nav: '#FFFFFF',
    input: '#FFFFFF',
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    // Backgrounds
    bg: {
      primary: '#0F1419',
      secondary: '#1A1F2E',
      tertiary: '#252D3D',
      hover: '#2F3A4F',
    },
    // Text
    text: {
      primary: '#F5F5F5',
      secondary: '#BDBDBD',
      tertiary: '#808080',
      inverse: '#1A1A1A',
    },
    // Borders
    border: {
      primary: '#3A3F4F',
      secondary: '#2A2F3F',
    },
    // Components
    card: '#1A1F2E',
    nav: '#0F1419',
    input: '#252D3D',
    // Status colors
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
  },
};

// Glassmorphism effect
export const GLASS_EFFECT =
  'backdrop-blur-md bg-opacity-10 border border-opacity-20';

// Shadow definitions
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-lg',
};

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation durations
export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};
