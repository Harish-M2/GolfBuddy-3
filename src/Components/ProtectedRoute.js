import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to home page with login modal if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not loading and no user, store the intended destination
    if (!loading && !currentUser) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
  }, [loading, currentUser, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Box sx={{ mt: 2, color: 'white', fontSize: '1.2rem' }}>
            Loading...
          </Box>
        </Box>
      </Box>
    );
  }

  // If no user, redirect to home with auth required flag
  if (!currentUser) {
    return <Navigate to="/?auth=required" replace state={{ from: location }} />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
