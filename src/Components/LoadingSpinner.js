import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { GolfCourse } from '@mui/icons-material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: '#1e40af',
            animationDuration: '800ms'
          }} 
        />
        <GolfCourse 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#059669',
            fontSize: 24
          }}
        />
      </Box>
      <Typography 
        variant="h6" 
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
