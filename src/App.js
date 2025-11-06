import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { Dashboard } from './Pages/Dashboard';
import  Settings  from './Pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ResponsiveAppBar />
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
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;