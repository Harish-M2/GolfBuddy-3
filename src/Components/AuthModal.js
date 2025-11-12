import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Login as LoginIcon, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const { signInWithEmailPassword, createUserWithEmailPassword, isNative } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 0) {
        // Sign In
        console.log(`🔐 Attempting sign in (${isNative ? 'Native' : 'Web'})...`);
        await signInWithEmailPassword(formData.email, formData.password);
        console.log('✅ Sign in successful!');
      } else {
        // Sign Up
        console.log(`🔐 Attempting sign up (${isNative ? 'Native' : 'Web'})...`);
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        // Create user account
        const user = await createUserWithEmailPassword(formData.email, formData.password);
        console.log('✅ Account created successfully!');
        
        // Update profile with display name if provided
        if (formData.displayName && user) {
          console.log('📝 Updating display name...');
          // For native, we need to update the profile separately
          if (isNative) {
            const { updateProfileNative } = await import('../firebase/nativeAuth');
            await updateProfileNative({ displayName: formData.displayName });
          } else {
            const { updateProfile } = await import('firebase/auth');
            await updateProfile(user, { displayName: formData.displayName });
          }
        }
      }
      // Call onAuthSuccess if provided, otherwise just close
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        onClose && onClose();
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af, #059669)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            GolfBuddy
          </Typography>

          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 3 }}
          >
            <Tab
              label="Sign In"
              icon={<LoginIcon />}
              iconPosition="start"
            />
            <Tab
              label="Sign Up"
              icon={<PersonAdd />}
              iconPosition="start"
            />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />

            {tab === 1 && (
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #047857 100%)'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                tab === 0 ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
