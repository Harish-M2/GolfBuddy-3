// Advanced animation utilities and components for GolfBuddy
import React from 'react';
import { Box, keyframes } from '@mui/material';

// Keyframe animations
export const animations = {
  // Entrance animations
  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  fadeInDown: keyframes`
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  fadeInLeft: keyframes`
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,

  fadeInRight: keyframes`
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,

  slideUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  scaleIn: keyframes`
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `,

  // Micro-interactions
  bounce: keyframes`
    0%, 20%, 53%, 80%, to {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -8px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0,-1px,0);
    }
  `,

  pulse: keyframes`
    from {
      transform: scale3d(1, 1, 1);
    }
    50% {
      transform: scale3d(1.05, 1.05, 1.05);
    }
    to {
      transform: scale3d(1, 1, 1);
    }
  `,

  shake: keyframes`
    from, to {
      transform: translate3d(0, 0, 0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translate3d(-10px, 0, 0);
    }
    20%, 40%, 60%, 80% {
      transform: translate3d(10px, 0, 0);
    }
  `,

  // Loading animations
  spin: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,

  ripple: keyframes`
    0% {
      transform: scale(0);
      opacity: 1;
    }
    20% {
      transform: scale(25);
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(40);
    }
  `,

  // Golf-specific animations
  golfSwing: keyframes`
    0% { transform: rotate(45deg); }
    50% { transform: rotate(-45deg); }
    100% { transform: rotate(45deg); }
  `,

  ballRoll: keyframes`
    0% { transform: translateX(0) rotate(0deg); }
    100% { transform: translateX(50px) rotate(180deg); }
  `,
};

// Animation timing functions
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Reusable animation components
export function AnimatedContainer({ 
  children, 
  animation = 'fadeInUp', 
  duration = '0.6s', 
  delay = '0s',
  easing = easings.easeOut,
  ...props 
}) {
  return (
    <Box
      sx={{
        animation: `${animations[animation]} ${duration} ${easing} ${delay} both`,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export function StaggeredContainer({ 
  children, 
  animation = 'slideUp', 
  staggerDelay = 0.1,
  ...props 
}) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Box {...props}>
      {childrenArray.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={`${index * staggerDelay}s`}
        >
          {child}
        </AnimatedContainer>
      ))}
    </Box>
  );
}

// Hover animation wrapper
export function HoverAnimated({ 
  children, 
  hoverAnimation = 'pulse',
  duration = '0.3s',
  ...props 
}) {
  return (
    <Box
      sx={{
        cursor: 'pointer',
        transition: `transform ${duration} ${easings.easeOut}`,
        '&:hover': {
          animation: `${animations[hoverAnimation]} ${duration} ${easings.bounce}`,
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

// Page transition wrapper
export function PageTransition({ children, ...props }) {
  return (
    <AnimatedContainer
      animation="fadeInUp"
      duration="0.5s"
      easing={easings.easeOut}
      sx={{
        minHeight: '100vh',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

// Loading animation component
export function LoadingRipple({ size = 40, color = 'primary' }) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          border: `2px solid currentColor`,
          opacity: 1,
          borderRadius: '50%',
          animation: `${animations.ripple} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
          color: color === 'primary' ? 'primary.main' : color,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          border: `2px solid currentColor`,
          opacity: 1,
          borderRadius: '50%',
          animation: `${animations.ripple} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
          animationDelay: '-0.5s',
          color: color === 'primary' ? 'primary.main' : color,
        }}
      />
    </Box>
  );
}

// Micro-interaction utilities
export const microInteractions = {
  // Button interactions
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  },

  buttonPress: {
    transform: 'translateY(0px)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.1s ease',
  },

  // Card interactions
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Scale interactions
  scaleOnHover: {
    '&:hover': {
      transform: 'scale(1.05)',
      transition: 'transform 0.2s ease',
    },
  },

  // Focus states
  focusRing: {
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  },
};

// Intersection Observer animation hook
export function useInViewAnimation(threshold = 0.1) {
  const [ref, setRef] = React.useState();
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, inView];
}

// Animation on scroll component
export function AnimateOnScroll({ children, animation = 'fadeInUp', ...props }) {
  const [ref, inView] = useInViewAnimation();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
