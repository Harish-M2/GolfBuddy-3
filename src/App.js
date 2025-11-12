import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERROR BOUNDARY CAUGHT:', error);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          overflow: 'auto',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>⚠️ Component Error Caught</h1>
          <h2>{this.state.error?.name}: {this.state.error?.message}</h2>
          <details style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '5px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Stack</summary>
            <pre style={{ overflow: 'auto', marginTop: '10px', fontSize: '12px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <details style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '5px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Component Stack</summary>
            <pre style={{ overflow: 'auto', marginTop: '10px', fontSize: '12px' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inner App component that uses theme
function AppContent() {
  const { muiTheme } = useTheme();

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <ResponsiveAppBar />
        <main id="main-content" tabIndex="-1">
          <Routes>
            {/* Public route - Home page accessible to everyone */}
            <Route path="/" element={<Home />} />
            
            {/* All pages PUBLIC for now (no auth required) */}
            <Route path="/golf" element={<Golf />} />
            <Route path="/buddies" element={<Buddies />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/teetimes" element={<TeeTimes />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/theme-debug" element={<ThemeDebug />} />
          </Routes>
        </main>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  // Using MOCK providers (no real Firebase, but pages work!)
  console.log('🚀 Running with MOCK Auth (all features enabled)');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <AppContent />
            </AccessibilityProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;