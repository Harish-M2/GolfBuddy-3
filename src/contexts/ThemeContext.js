import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, THEME_MODES } from '../theme';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // Get initial theme from localStorage or default to light
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('golfbuddy-theme-mode');
      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    return THEME_MODES.LIGHT;
  };

  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const [currentTheme, setCurrentTheme] = useState(() => createTheme(themeMode));

  // System theme detection
  const prefersDarkMode = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : false;

  // Determine effective theme mode
  const getEffectiveMode = (mode) => {
    if (mode === THEME_MODES.AUTO) {
      return prefersDarkMode ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    }
    return mode;
  };

  // Update theme when mode changes
  useEffect(() => {
    const effectiveMode = getEffectiveMode(themeMode);
    setCurrentTheme(createTheme(effectiveMode));

    // Save to localStorage
    try {
      localStorage.setItem('golfbuddy-theme-mode', themeMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    // Update CSS custom properties for smooth transitions
    const root = document.documentElement;
    const colors = createTheme(effectiveMode).colors;
    
    root.style.setProperty('--bg-primary', colors.background);
    root.style.setProperty('--bg-surface', colors.surface);
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--primary-main', colors.primary.main);
    root.style.setProperty('--secondary-main', colors.secondary.main);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary.main);
    }
  }, [themeMode, prefersDarkMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode !== THEME_MODES.AUTO) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const effectiveMode = getEffectiveMode(THEME_MODES.AUTO);
      setCurrentTheme(createTheme(effectiveMode));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Theme switching functions
  const toggleTheme = () => {
    const currentEffectiveMode = getEffectiveMode(themeMode);
    const newMode = currentEffectiveMode === THEME_MODES.LIGHT 
      ? THEME_MODES.DARK 
      : THEME_MODES.LIGHT;
    setThemeMode(newMode);
  };

  const setTheme = (mode) => {
    if (Object.values(THEME_MODES).includes(mode)) {
      setThemeMode(mode);
    }
  };

  const isDark = getEffectiveMode(themeMode) === THEME_MODES.DARK;

  const value = {
    theme: currentTheme,
    muiTheme: currentTheme.muiTheme,
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
    THEME_MODES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
