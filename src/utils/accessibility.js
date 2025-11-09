// Accessibility utilities and helpers for GolfBuddy
import React from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Brightness4, Brightness7, TextFields, VolumeUp } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Screen reader announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.dispatchEvent(new CustomEvent('closeFocusTrap'));
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstElement.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// High contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);
    
    const handleChange = (e) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// Keyboard navigation helper
export const useKeyboardNavigation = (onEnter, onEscape, onArrowUp, onArrowDown) => {
  const handleKeyDown = React.useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        onEnter?.(e);
        break;
      case 'Escape':
        onEscape?.(e);
        break;
      case 'ArrowUp':
        onArrowUp?.(e);
        break;
      case 'ArrowDown':
        onArrowDown?.(e);
        break;
      default:
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);
  
  return { onKeyDown: handleKeyDown };
};

// Accessible button component with focus management
export const AccessibleButton = React.forwardRef(({ 
  children, 
  onClick, 
  disabled, 
  ariaLabel, 
  ariaDescribedBy,
  variant = 'contained',
  startIcon,
  endIcon,
  size = 'medium',
  ...props 
}, ref) => {
  const buttonRef = React.useRef();
  const actualRef = ref || buttonRef;
  
  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    announceToScreenReader('Action completed');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };
  
  return (
    <Button
      ref={actualRef}
      variant={variant}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      sx={{
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
});

// Skip to content link
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => (
  <Button
    href={href}
    sx={{
      position: 'absolute',
      left: '-9999px',
      zIndex: 999,
      padding: '8px 16px',
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      textDecoration: 'none',
      '&:focus': {
        left: '6px',
        top: '6px',
      },
    }}
  >
    {children}
  </Button>
);

// Live region for dynamic content updates
export const LiveRegion = ({ children, level = 'polite', atomic = true, ...props }) => (
  <div
    aria-live={level}
    aria-atomic={atomic}
    aria-relevant="additions text"
    className="sr-only"
    {...props}
  >
    {children}
  </div>
);

// Accessible form field with proper labeling
export const AccessibleFormField = ({ 
  label, 
  error, 
  helperText, 
  required, 
  children, 
  id,
  ...props 
}) => {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  
  return (
    <Box {...props}>
      <label htmlFor={fieldId} style={{ fontWeight: 500, marginBottom: '4px', display: 'block' }}>
        {label} {required && <span aria-label="required">*</span>}
      </label>
      {React.cloneElement(children, {
        id: fieldId,
        'aria-describedby': [errorId, helperId].filter(Boolean).join(' '),
        'aria-invalid': !!error,
        required,
      })}
      {error && (
        <div id={errorId} role="alert" style={{ color: 'error.main', fontSize: '0.875rem', marginTop: '4px' }}>
          {error}
        </div>
      )}
      {helperText && (
        <div id={helperId} style={{ color: 'text.secondary', fontSize: '0.875rem', marginTop: '4px' }}>
          {helperText}
        </div>
      )}
    </Box>
  );
};

// Accessibility preferences context
const AccessibilityContext = React.createContext();

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = React.useState(() => {
    const saved = localStorage.getItem('golfbuddy-accessibility-preferences');
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReaderOptimized: false,
    };
  });
  
  const updatePreference = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('golfbuddy-accessibility-preferences', JSON.stringify(newPreferences));
    
    // Apply CSS custom properties
    document.documentElement.style.setProperty(
      '--text-size-multiplier', 
      newPreferences.largeText ? '1.2' : '1'
    );
    
    document.documentElement.classList.toggle('high-contrast', newPreferences.highContrast);
    document.documentElement.classList.toggle('reduced-motion', newPreferences.reducedMotion);
  };
  
  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility settings panel
export const AccessibilitySettings = () => {
  const { preferences, updatePreference } = useAccessibility();
  const { theme } = useTheme();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Accessibility Settings
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1">High Contrast</Typography>
            <Typography variant="body2" color="text.secondary">
              Increase color contrast for better visibility
            </Typography>
          </Box>
          <AccessibleButton
            variant={preferences.highContrast ? 'contained' : 'outlined'}
            onClick={() => updatePreference('highContrast', !preferences.highContrast)}
            ariaLabel={`${preferences.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
            startIcon={<Brightness4 />}
          >
            {preferences.highContrast ? 'ON' : 'OFF'}
          </AccessibleButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1">Reduce Motion</Typography>
            <Typography variant="body2" color="text.secondary">
              Minimize animations and transitions
            </Typography>
          </Box>
          <AccessibleButton
            variant={preferences.reducedMotion ? 'contained' : 'outlined'}
            onClick={() => updatePreference('reducedMotion', !preferences.reducedMotion)}
            ariaLabel={`${preferences.reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
          >
            {preferences.reducedMotion ? 'ON' : 'OFF'}
          </AccessibleButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1">Large Text</Typography>
            <Typography variant="body2" color="text.secondary">
              Increase text size for better readability
            </Typography>
          </Box>
          <AccessibleButton
            variant={preferences.largeText ? 'contained' : 'outlined'}
            onClick={() => updatePreference('largeText', !preferences.largeText)}
            ariaLabel={`${preferences.largeText ? 'Disable' : 'Enable'} large text mode`}
            startIcon={<TextFields />}
          >
            {preferences.largeText ? 'ON' : 'OFF'}
          </AccessibleButton>
        </Box>
      </Box>
    </Box>
  );
};

// CSS for screen reader only content
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Hook for managing focus on route changes
export const useFocusOnRouteChange = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      announceToScreenReader(`Navigated to ${document.title}`);
    }
  }, [location.pathname]);
};
