// Professional Dashboard Layout for GolfBuddy
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper,
  Avatar, Button, useTheme, Divider, Card, CardContent, IconButton
} from '@mui/material';
import {
  Group, GolfCourse, Photo, EmojiEvents,
  LocationOn, Settings as SettingsIcon, TrendingUp,
  Schedule, SportsGolf, Add, ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserBuddies, 
  getFavoriteCourses,
  getUserGolfPhotos,
  getBuddyRequests
} from '../firebase/database';
import LoadingSpinner from '../Components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { getCachedWeather, getDefaultWeather } from '../services/weatherService';

export function ProfessionalDashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const { theme, isDark } = useCustomTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    buddies: 0,
    favoriteCourses: 0,
    photos: 0,
    pendingRequests: 0
  });
  const [recentBuddies, setRecentBuddies] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const [buddies, courses, photos, requests] = await Promise.all([
          getUserBuddies(currentUser.uid),
          getFavoriteCourses(currentUser.uid),
          getUserGolfPhotos(currentUser.uid),
          getBuddyRequests(currentUser.uid)
        ]);

        setStats({
          buddies: buddies.length,
          favoriteCourses: courses.length,
          photos: photos.length,
          pendingRequests: requests.received.filter(r => r.status === 'pending').length
        });

        setRecentBuddies(buddies.slice(0, 3));
        setRecentPhotos(photos.slice(0, 4));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  // Load weather
  useEffect(() => {
    const loadWeather = async () => {
      setWeatherLoading(true);
      const location = userProfile?.location;
      
      if (!location) {
        setWeather(getDefaultWeather());
        setWeatherLoading(false);
        return;
      }

      try {
        const weatherData = await getCachedWeather(location);
        setWeather(weatherData);
      } catch (error) {
        setWeather(getDefaultWeather());
      } finally {
        setWeatherLoading(false);
      }
    };

    if (userProfile) {
      loadWeather();
    }
  }, [userProfile]);

  const getSkillLevel = () => {
    const level = userProfile?.skillLevel?.toLowerCase();
    switch (level) {
      case 'beginner':
        return { label: 'Beginner', progress: 33, color: '#10b981' };
      case 'intermediate':
        return { label: 'Intermediate', progress: 66, color: '#f59e0b' };
      case 'advanced':
        return { label: 'Advanced', progress: 100, color: '#ef4444' };
      default:
        return { label: 'Not Set', progress: 0, color: '#6b7280' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const skillInfo = getSkillLevel();

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Sign in to view your dashboard
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="xl">
        
        {/* Professional Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '1.75rem', md: '2rem' },
                  mb: 0.5,
                }}
              >
                Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Golfer'}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1rem',
                }}
              >
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={userProfile?.photoURL}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: skillInfo.color,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  border: '2px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {!userProfile?.photoURL && getInitials(userProfile?.displayName)}
              </Avatar>
              
              <IconButton
                onClick={() => navigate('/settings')}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Group sx={{ color: 'primary.contrastText', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.buddies}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Golf Buddies
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <GolfCourse sx={{ color: 'success.contrastText', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.favoriteCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Favorite Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.main', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Photo sx={{ color: 'warning.contrastText', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.photos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Photos Shared
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'secondary.main', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <EmojiEvents sx={{ color: 'secondary.contrastText', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.pendingRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Weather Widget */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Today's Weather
                      </Typography>
                      {weather?.city && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {weather.city}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {weatherLoading ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary">Loading weather...</Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {weather?.temp || 22}°
                          </Typography>
                          <Typography variant="h4">
                            {weather?.emoji || '☀️'}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                          {weather?.golfMessage || 'Great day for golf!'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {weather?.description || 'Sunny'} • Wind {weather?.windSpeed || 5} km/h
                        </Typography>
                        
                        {weather?.feelsLike && weather.feelsLike !== weather.temp && (
                          <Typography variant="body2" color="text.secondary">
                            Feels like {weather.feelsLike}°C
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      This Week
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            2
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Rounds Played
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            85
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Best Score
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Group />}
                          onClick={() => navigate('/buddies')}
                          sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Find Buddies
                        </Button>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<GolfCourse />}
                          onClick={() => navigate('/courses')}
                          sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Courses
                        </Button>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<SportsGolf />}
                          onClick={() => navigate('/scores')}
                          sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Track Score
                        </Button>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Schedule />}
                          onClick={() => navigate('/teetimes')}
                          sx={{ 
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Tee Times
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Recent Buddies */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recent Buddies
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/buddies')}
                        sx={{ textTransform: 'none' }}
                      >
                        View All
                      </Button>
                    </Box>
                    
                    {recentBuddies.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {recentBuddies.map((buddy, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={buddy.photoURL}
                              sx={{ width: 40, height: 40 }}
                            >
                              {buddy.displayName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {buddy.displayName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {buddy.skillLevel} • {buddy.location}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary" variant="body2">
                          No buddies yet. Find some golf partners!
                        </Typography>
                        <Button
                          startIcon={<Add />}
                          onClick={() => navigate('/buddies')}
                          sx={{ mt: 1, textTransform: 'none' }}
                        >
                          Find Buddies
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Activity Feed */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Recent Activity
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'success.main', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <SportsGolf sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="body2">
                            Played at Pebble Beach
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Yesterday
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Group sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="body2">
                            Connected with Mike Johnson
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            2 days ago
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}
