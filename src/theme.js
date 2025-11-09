// Global theme configuration for GolfBuddy
import { createTheme as createMuiTheme } from '@mui/material/styles';

// Theme modes and context
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Light Theme Colors
const lightColors = {
  // Primary (Golf Course Green)
  primary: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  // Secondary (Sky Blue)
  secondary: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  },
  // Accent (Gold/Premium)
  accent: {
    gold: '#f59e0b',
    goldLight: '#fbbf24',
    goldDark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
  // Neutrals
  background: '#f8fafc',
  surface: '#ffffff',
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
};

// Dark Theme Colors
const darkColors = {
  // Primary (Brighter golf green for dark mode)
  primary: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  // Secondary (Brighter sky blue)
  secondary: {
    main: '#38bdf8',
    light: '#60a5fa',
    dark: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)',
  },
  // Accent (Brighter gold)
  accent: {
    gold: '#fbbf24',
    goldLight: '#fcd34d',
    goldDark: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
  },
  // Status Colors (adjusted for dark mode)
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  // Dark mode neutrals
  background: '#0f172a',
  surface: '#1e293b',
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    disabled: '#64748b',
  },
  // Dark overlays
  overlay: {
    light: 'rgba(30, 41, 59, 0.9)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
};

// Theme factory function
export const createTheme = (mode = THEME_MODES.LIGHT) => {
  const colors = mode === THEME_MODES.DARK ? darkColors : lightColors;
  const isDark = mode === THEME_MODES.DARK;
  
  // Create MUI theme
  const muiTheme = createMuiTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      success: {
        main: colors.success,
      },
      warning: {
        main: colors.warning,
      },
      error: {
        main: colors.error,
      },
      info: {
        main: colors.info,
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
            minHeight: '100vh',
          },
        },
      },
    },
  });
  
  return {
    mode,
    colors,
    muiTheme,

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    secondary: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    gold: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98))',
    glow: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    card: '0 8px 32px rgba(0, 0, 0, 0.08)',
    cardHover: '0 20px 40px rgba(0, 0, 0, 0.12)',
    glow: '0 0 20px rgba(5, 150, 105, 0.3)',
    glowBlue: '0 0 20px rgba(14, 165, 233, 0.3)',
  },

  // Border Radius
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Spacing (multiplier based on 4px)
  spacing: (factor) => `${factor * 0.25}rem`,

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: '"Inter", -apple-system, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Animations
  animations: {
    fadeIn: {
      animation: 'fadeIn 0.3s ease-in',
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    },
    slideUp: {
      animation: 'slideUp 0.4s ease-out',
      '@keyframes slideUp': {
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
    },
    scaleIn: {
      animation: 'scaleIn 0.3s ease-out',
      '@keyframes scaleIn': {
        from: { transform: 'scale(0.9)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.7 },
      },
    },
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  };
};

// Helper function to create consistent card styles
export const createCardStyle = (theme) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: theme.shadows.card,
  borderRadius: theme.radius.xl,
  transition: `all ${theme.transitions.base}`,
  '&:hover': {
    boxShadow: theme.shadows.cardHover,
    transform: 'translateY(-4px)',
  },
});

// Helper function for gradient text
export const createGradientText = (theme, gradient) => ({
  background: gradient || theme.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

// Helper function for stat cards
export const createStatCardStyle = (theme, color) => {
  const cardStyle = createCardStyle(theme);
  const mainColor = color || theme.colors.primary.main;
  
  return {
    ...cardStyle,
    background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}05 100%)`,
    border: `1px solid ${mainColor}30`,
    '&:hover': {
      ...cardStyle['&:hover'],
      background: `linear-gradient(135deg, ${mainColor}20 0%, ${mainColor}10 100%)`,
    },
  };
};

// Create a default theme instance for convenience
const defaultTheme = createTheme();

// Backward compatibility exports
export const theme = defaultTheme;
export const cardStyle = createCardStyle(defaultTheme);
export const gradientText = (gradient) => createGradientText(defaultTheme, gradient);
export const statCardStyle = (color) => createStatCardStyle(defaultTheme, color);

export default defaultTheme;
