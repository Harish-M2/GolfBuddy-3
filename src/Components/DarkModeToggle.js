import React from 'react';
import {
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness6,
  SettingsBrightness,
  Brightness4,
  BrightnessAuto
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

// Simple toggle switch component
export function DarkModeToggle({ variant = 'switch' }) {
  const { theme, themeMode, isDark, toggleTheme, setTheme, THEME_MODES } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (mode) => {
    setTheme(mode);
    handleMenuClose();
  };

  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            color="primary"
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: isDark ? '#fbbf24' : '#fbbf24',
              },
              '& .MuiSwitch-track': {
                backgroundColor: isDark ? '#374151' : '#d1d5db',
              },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isDark ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Box>
        }
        sx={{
          color: theme.muiTheme.palette.text.primary,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.9rem',
            fontWeight: 500,
          }
        }}
      />
    );
  }

  if (variant === 'button') {
    return (
      <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          size="medium"
          sx={{
            color: theme.muiTheme.palette.text.primary,
            backgroundColor: theme.muiTheme.palette.background.paper,
            border: `1px solid ${theme.muiTheme.palette.text.disabled}`,
            '&:hover': {
              backgroundColor: theme.muiTheme.palette.primary.main,
              color: 'white',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'appbar') {
    return (
      <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          size="medium"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        <Tooltip title="Theme settings">
          <IconButton
            onClick={handleMenuClick}
            size="medium"
            sx={{
              color: theme.muiTheme.palette.text.primary,
              backgroundColor: theme.muiTheme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.muiTheme.palette.primary.main,
                color: 'white',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Brightness6 />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: theme.muiTheme.palette.background.paper,
              color: theme.muiTheme.palette.text.primary,
              border: `1px solid ${theme.muiTheme.palette.text.disabled}`,
              minWidth: 200,
            }
          }}
        >
          <MenuItem
            onClick={() => handleThemeSelect(THEME_MODES.LIGHT)}
            selected={themeMode === THEME_MODES.LIGHT}
          >
            <ListItemIcon>
              <LightMode sx={{ color: theme.muiTheme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText primary="Light Mode" />
          </MenuItem>
          
          <MenuItem
            onClick={() => handleThemeSelect(THEME_MODES.DARK)}
            selected={themeMode === THEME_MODES.DARK}
          >
            <ListItemIcon>
              <DarkMode sx={{ color: theme.muiTheme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText primary="Dark Mode" />
          </MenuItem>
          
          <Divider sx={{ backgroundColor: theme.muiTheme.palette.text.disabled }} />
          
          <MenuItem
            onClick={() => handleThemeSelect(THEME_MODES.AUTO)}
            selected={themeMode === THEME_MODES.AUTO}
          >
            <ListItemIcon>
              <BrightnessAuto sx={{ color: theme.muiTheme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText 
              primary="Auto" 
              secondary="Follow system theme"
              secondaryTypographyProps={{
                sx: { color: theme.muiTheme.palette.text.secondary }
              }}
            />
          </MenuItem>
        </Menu>
      </>
    );
  }

  // Default icon button
  return (
    <Tooltip title={`Current: ${themeMode} mode`}>
      <IconButton
        onClick={toggleTheme}
        size="small"
        sx={{
          color: theme.muiTheme.palette.text.secondary,
          '&:hover': {
            color: theme.muiTheme.palette.primary.main,
          },
        }}
      >
        {isDark ? <Brightness4 /> : <SettingsBrightness />}
      </IconButton>
    </Tooltip>
  );
}

// Enhanced toggle with animation
export function AnimatedDarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Box
      onClick={toggleTheme}
      sx={{
        width: 60,
        height: 30,
        borderRadius: '15px',
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          backgroundColor: isDark ? '#fbbf24' : '#ffffff',
          position: 'absolute',
          left: isDark ? '32px' : '2px',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {isDark ? (
          <DarkMode sx={{ fontSize: 16, color: '#1f2937' }} />
        ) : (
          <LightMode sx={{ fontSize: 16, color: '#f59e0b' }} />
        )}
      </Box>
    </Box>
  );
}
