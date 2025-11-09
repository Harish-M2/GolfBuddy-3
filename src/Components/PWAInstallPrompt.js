import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Slide
} from '@mui/material';
import {
  GetApp,
  Close,
  PhoneIphone,
  Laptop
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setShowInstallPrompt(false);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      const result = await deferredPrompt.prompt();
      console.log('PWA: Install prompt result:', result);

      // Reset the deferred prompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstallable(false);
    } catch (error) {
      console.error('PWA: Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isStandalone || 
      sessionStorage.getItem('pwa-install-dismissed') ||
      !isInstallable || 
      !deferredPrompt) {
    return null;
  }

  return (
    <Slide direction="up" in={showInstallPrompt} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 1300,
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        <Card
          sx={{
            background: isDark 
              ? `linear-gradient(135deg, ${theme.muiTheme.palette.background.paper}, ${theme.muiTheme.palette.background.paper}dd)`
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(10px)',
            border: isDark 
              ? `1px solid ${theme.muiTheme.palette.text.disabled}30`
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <GetApp sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: theme.muiTheme.palette.text.primary,
                  fontSize: '1rem',
                  mb: 0.5 
                }}>
                  Install GolfBuddy
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.muiTheme.palette.text.secondary,
                  fontSize: '0.875rem'
                }}>
                  Add to your home screen for quick access
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{ 
                  color: theme.muiTheme.palette.text.secondary,
                  ml: 1 
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: theme.muiTheme.palette.text.secondary,
                fontSize: '0.75rem'
              }}>
                <PhoneIphone sx={{ fontSize: 14 }} />
                <Typography variant="caption">Mobile friendly</Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: theme.muiTheme.palette.text.secondary,
                fontSize: '0.75rem'
              }}>
                <Laptop sx={{ fontSize: 14 }} />
                <Typography variant="caption">Works offline</Typography>
              </Box>
            </Box>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleInstallClick}
              startIcon={<GetApp />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Install App
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Slide>
  );
}

// Snackbar version for less intrusive install prompt
export function PWAInstallSnackbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show snackbar after a longer delay
      setTimeout(() => {
        setShowInstall(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
    setShowInstall(false);
  };

  return (
    <Snackbar
      open={showInstall}
      autoHideDuration={8000}
      onClose={() => setShowInstall(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white',
          },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleInstall}
            startIcon={<GetApp />}
          >
            Install
          </Button>
        }
        onClose={() => setShowInstall(false)}
      >
        Install GolfBuddy for a better experience!
      </Alert>
    </Snackbar>
  );
}

export default PWAInstallPrompt;
