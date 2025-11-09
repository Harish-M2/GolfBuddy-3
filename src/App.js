import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ResponsiveAppBar from './Components/AppBar';
import ProtectedRoute from './Components/ProtectedRoute';
import { Home } from './Pages/Home';
import { Golf } from './Pages/Golf';
import { Buddies } from './Pages/Buddies';
import { Chat } from './Pages/Chat';
import { TeeTimes } from './Pages/TeeTimes';
import { Scores } from './Pages/Scores';
import { Courses } from './Pages/Courses';
import { Photos } from './Pages/Photos';
import Dashboard from './Pages/Dashboard';
import  Settings  from './Pages/Settings';
import { ThemeDebug } from './Pages/ThemeDebug';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { PWAInstallPrompt } from './Components/PWAInstallPrompt';
import { SkipLink, AccessibilityProvider } from './utils/accessibility';

// Inner App component that uses theme
function AppContent() {
  const { muiTheme } = useTheme();

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <SkipLink />
        <ResponsiveAppBar />
        <main id="main-content" tabIndex="-1">
          <Routes>
          {/* Public route - Home page accessible to everyone */}
          <Route path="/" element={<Home />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/golf" element={<ProtectedRoute><Golf /></ProtectedRoute>} />
          <Route path="/buddies" element={<ProtectedRoute><Buddies /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/teetimes" element={<ProtectedRoute><TeeTimes /></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute><Scores /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/photos" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/theme-debug" element={<ThemeDebug />} />
          </Routes>
        </main>
        <PWAInstallPrompt />
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AppContent />
          </AccessibilityProvider>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;