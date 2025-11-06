import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import theme, { statCardStyle, gradientText } from '../theme';

// Animated Stat Card Component
export function StatCard({ icon: Icon, title, value, subtitle, color, trend }) {
  return (
    <Card 
      sx={{
        ...statCardStyle(color),
        animation: 'slideUp 0.5s ease-out',
        '@keyframes slideUp': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: theme.radius.lg,
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: theme.transitions.base,
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              },
            }}
          >
            <Icon sx={{ fontSize: 28, color }} />
          </Box>
          {trend && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: theme.radius.full,
                background: trend > 0 ? '#10b98120' : '#ef444420',
                color: trend > 0 ? '#10b981' : '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Box>
          )}
        </Box>
        
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            ...gradientText(`linear-gradient(135deg, ${color}, ${color}80)`),
            mb: 0.5,
            fontSize: '2.5rem',
          }}
        >
          {value}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: theme.colors.text.secondary,
            fontWeight: 600,
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" sx={{ color: theme.colors.text.disabled }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Gradient Card Component
export function GradientCard({ children, gradient, sx, ...props }) {
  return (
    <Card
      sx={{
        background: gradient || theme.gradients.card,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: theme.shadows.card,
        borderRadius: theme.radius.xl,
        transition: theme.transitions.base,
        '&:hover': {
          boxShadow: theme.shadows.cardHover,
          transform: 'translateY(-4px)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}

// Hover Card with Scale Effect
export function HoverCard({ children, sx, ...props }) {
  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: theme.shadows.card,
        borderRadius: theme.radius.xl,
        transition: theme.transitions.smooth,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows.cardHover,
          transform: 'scale(1.02)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.gradients.glow,
          opacity: 0,
          transition: theme.transitions.base,
        },
        '&:hover::before': {
          opacity: 1,
        },
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Card>
  );
}

// Loading Skeleton Component
export function LoadingSkeleton({ width = '100%', height = 20, variant = 'rectangular', animation = 'pulse' }) {
  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? theme.radius.md : 0,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: animation === 'pulse' 
          ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          : 'shimmer 2s infinite',
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      }}
    />
  );
}

// Achievement Badge Component
export function AchievementBadge({ icon: Icon, title, description, color = theme.colors.accent.gold }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: theme.radius.lg,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        transition: theme.transitions.base,
        '&:hover': {
          background: `${color}20`,
          transform: 'translateX(8px)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: theme.radius.full,
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}40`,
        }}
      >
        <Icon sx={{ color: 'white', fontSize: 24 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

// Animated Button Component
export function AnimatedButton({ children, variant = 'contained', sx, ...props }) {
  const baseStyle = {
    borderRadius: theme.radius.lg,
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    py: 1.5,
    transition: theme.transitions.base,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.6s, height 0.6s',
    },
    '&:hover::before': {
      width: '300px',
      height: '300px',
    },
  };

  const variantStyles = {
    contained: {
      background: theme.gradients.primary,
      color: 'white',
      boxShadow: theme.shadows.md,
      '&:hover': {
        boxShadow: theme.shadows.lg,
        transform: 'translateY(-2px)',
      },
    },
    outlined: {
      border: `2px solid ${theme.colors.primary.main}`,
      color: theme.colors.primary.main,
      '&:hover': {
        background: `${theme.colors.primary.main}10`,
        transform: 'translateY(-2px)',
      },
    },
    text: {
      color: theme.colors.primary.main,
      '&:hover': {
        background: `${theme.colors.primary.main}10`,
      },
    },
  };

  return (
    <Box
      component="button"
      sx={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sx,
      }}
      {...props}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Box>
  );
}
