import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle } from '@mui/icons-material';
import { Capacitor } from '@capacitor/core';
import golfVideo from '../assets/golfback.mp4';
import golfPoster from '../assets/golf.jpg';
import AuthModal from '../Components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Snackbar, Alert, ThemeProvider } from '@mui/material';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const { currentUser } = useAuth();

  const { theme } = useTheme();

  useEffect(() => {
    // Check if auth is required (from protected route redirect)
    if (searchParams.get('auth') === 'required' && !currentUser) {
      setAuthModalOpen(true);
      setShowAuthMessage(true);
      // Remove the auth parameter from URL
      searchParams.delete('auth');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, currentUser]);

  useEffect(() => {
    console.log('Golf video path:', golfVideo);
    console.log('Golf poster path:', golfPoster);
    
    // Try to play video after component mounts
    const timer = setTimeout(() => {
      if (videoRef.current) {
        console.log('Attempting to play video...');
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Video playing successfully');
          }).catch(err => {
            console.error('Video autoplay failed:', err);
            // This is normal - many browsers block autoplay
          });
        }
      }
    }, 100); // Reduced delay

    return () => clearTimeout(timer);
  }, []);

  const handleEnterClick = () => {
    // Try to start video when user interacts
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(err => {
        console.log('Could not play video on user interaction:', err);
      });
    }
    navigate('/golf');
  };

  const handleVideoError = (e) => {
    console.error('Video failed to load:', e);
    console.log('Video element:', e.target);
    console.log('Video error code:', e.target.error?.code);
    console.log('Video error message:', e.target.error?.message);
  };

  const handleVideoLoad = (e) => {
    console.log('Video loaded successfully:', e.target);
    console.log('Video duration:', e.target.duration);
    console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
  };

  const handleVideoCanPlay = (e) => {
    console.log('Video can play:', e.target);
    e.target.play().catch(err => {
      console.error('Failed to autoplay video:', err);
    });
  };

  const handleBackgroundClick = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().then(() => {
        console.log('Video started playing after background click');
      }).catch(err => {
        console.log('Could not play video after background click:', err);
      });
    }
  };

  const isNative = Capacitor.isNativePlatform();
  
  return (
    <ThemeProvider theme={theme.muiTheme}>
      <div className="home-container" onClick={handleBackgroundClick}>
        {/* Local Video Background - Skip large video on native for now */}
        <div className="video-background">
          {!isNative && (
            <video
              ref={videoRef}
              className="background-video"
              autoPlay
              muted
              loop
              playsInline
              poster={golfPoster}
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoCanPlay}
              preload="auto"
            >
              <source src={golfVideo} type="video/mp4" />
              <source src="/golfback.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {isNative && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)',
              zIndex: 0
            }} />
          )}
          
          <div className="video-overlay"></div>
        </div>

        {/* Content */}
        <div className="home-content">
          <div className="welcome-section">
            <h1 className="main-title">GolfBuddy</h1>
            <p className="subtitle">Find Your Perfect Golf Partner</p>
          </div>
          
          <div className="enter-button-container">
            <button className="enter-button" onClick={handleEnterClick}>
              <PlayCircle className="enter-icon" />
              <span className="enter-text">Enter</span>
            </button>
            <p className="enter-description">Start Your Golf Journey</p>
          </div>
        </div>

        {/* TEMP: AuthModal disabled for testing
        <AuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={() => {
            setAuthModalOpen(false);
            // Redirect to the page they were trying to access
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
              sessionStorage.removeItem('redirectAfterLogin');
              navigate(redirectPath);
            }
          }}
        />
        */}
        <Snackbar 
          open={showAuthMessage} 
          autoHideDuration={6000} 
          onClose={() => setShowAuthMessage(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowAuthMessage(false)} severity="warning" variant="filled">
            🔒 Please sign in or create an account to access this page
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

