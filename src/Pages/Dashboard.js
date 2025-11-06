import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper,
  Avatar, LinearProgress, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Button
} from '@mui/material';
import {
  Group, GolfCourse, Photo, EmojiEvents,
  LocationOn, Assessment, Favorite,
  Add, Schedule, SportsGolf
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

export function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    buddies: 0,
    favoriteCourses: 0,
    photos: 0,
    pendingRequests: 0
  });
  const [recentBuddies, setRecentBuddies] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);

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
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Sign in to view your dashboard
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        rgba(59, 130, 246, 0.02) 0%, 
        rgba(16, 185, 129, 0.02) 25%,
        rgba(236, 72, 153, 0.02) 50%,
        rgba(251, 191, 36, 0.02) 75%,
        rgba(139, 92, 246, 0.02) 100%
      ), #fdfdfd`,
      py: { xs: 2, md: 3 },
      px: { xs: 1, md: 0 }
    }}>
      <Container maxWidth="xl">
        {/* Header Section - Compact & Modern */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Welcome Message */}
            <Grid item xs={12} md={7} lg={8}>
              <Box>
                <Typography 
                  variant="h2" 
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1e40af, #059669)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    mb: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  Hey {userProfile?.displayName?.split(' ')[0] || 'Golfer'}! 👋
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(15, 23, 42, 0.6)',
                    fontWeight: 500,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }}
                >
                  Ready for your next round?
                </Typography>
              </Box>
            </Grid>
            
            {/* Profile Quick Card */}
            <Grid item xs={12} md={5} lg={4}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={userProfile?.photoURL}
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: skillInfo.color,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      boxShadow: `0 6px 20px ${skillInfo.color}30`,
                      border: '2px solid white',
                    }}
                  >
                    {!userProfile?.photoURL && getInitials(userProfile?.displayName)}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(15, 23, 42, 0.6)', 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Level
                      </Typography>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.3,
                          borderRadius: '8px',
                          background: skillInfo.color,
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {skillInfo.label}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={skillInfo.progress}
                      sx={{
                        height: 6,
                        borderRadius: '8px',
                        bgcolor: 'rgba(0,0,0,0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: skillInfo.color,
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Box>
                  
                  <Button
                    onClick={() => navigate('/settings')}
                    sx={{
                      minWidth: 'auto',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(148, 163, 184, 0.1)',
                      color: '#64748b',
                      '&:hover': {
                        background: 'rgba(148, 163, 184, 0.2)',
                      },
                    }}
                  >
                    <Assessment sx={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Overview - Compact Row */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 44, md: 52 },
                      height: { xs: 44, md: 52 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                      boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)',
                    }}
                  >
                    <Group sx={{ color: 'white', fontSize: { xs: 18, md: 22 } }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                    {stats.buddies}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                    Buddies
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 44, md: 52 },
                      height: { xs: 44, md: 52 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.25)',
                    }}
                  >
                    <Favorite sx={{ color: 'white', fontSize: { xs: 18, md: 22 } }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                    {stats.favoriteCourses}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                    Courses
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 44, md: 52 },
                      height: { xs: 44, md: 52 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    <Photo sx={{ color: 'white', fontSize: { xs: 18, md: 22 } }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b', fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                    {stats.photos}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                    Photos
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 44, md: 52 },
                      height: { xs: 44, md: 52 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.25)',
                    }}
                  >
                    <EmojiEvents sx={{ color: 'white', fontSize: { xs: 18, md: 22 } }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#8b5cf6', fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                    {stats.pendingRequests}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                    Requests
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Activity & Actions */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Quick Actions */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                    ⚡ Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Group />}
                        onClick={() => navigate('/golf')}
                        sx={{ 
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          borderColor: '#059669',
                          color: '#059669',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#059669',
                            background: 'rgba(5, 150, 105, 0.05)',
                          },
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
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.05)',
                          },
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
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          borderColor: '#8b5cf6',
                          color: '#8b5cf6',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#8b5cf6',
                            background: 'rgba(139, 92, 246, 0.05)',
                          },
                        }}
                      >
                        Scores
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
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          borderColor: '#f59e0b',
                          color: '#f59e0b',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#f59e0b',
                            background: 'rgba(245, 158, 11, 0.05)',
                          },
                        }}
                      >
                        Tee Times
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Weather & Quick Info */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Box sx={{ 
                        position: 'absolute', 
                        top: -20, 
                        right: -20, 
                        fontSize: '80px', 
                        opacity: 0.2 
                      }}>
                        ☀️
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Perfect Golf Weather!
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        72°F
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Sunny, Light breeze • Great for golf! 🏌️‍♂️
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                        This Week
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                            2
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                            Rounds Played
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                            85
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                            Best Score
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              {/* Recent Buddies */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    height: '300px',
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Recent Buddies
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate('/golf')}
                      sx={{
                        minWidth: 'auto',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #047857, #059669)',
                        },
                      }}
                    >
                      <Add sx={{ fontSize: 16 }} />
                    </Button>
                  </Box>
                  
                  {recentBuddies.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Group sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                        No buddies yet
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/golf')}
                        sx={{
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                        }}
                      >
                        Find Buddies
                      </Button>
                    </Box>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {recentBuddies.map((buddy) => (
                        <ListItem key={buddy.id} sx={{ px: 0, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar 
                              src={buddy.photoURL}
                              sx={{ bgcolor: '#059669', width: 40, height: 40 }}
                            >
                              {getInitials(buddy.displayName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={buddy.displayName}
                            secondary={buddy.location || 'Location not set'}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ fontSize: '0.8rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* Recent Photos */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    height: '300px',
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Recent Photos
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate('/photos')}
                      sx={{
                        minWidth: 'auto',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                        },
                      }}
                    >
                      <Add sx={{ fontSize: 16 }} />
                    </Button>
                  </Box>
                  
                  {recentPhotos.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Photo sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                        No photos yet
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/photos')}
                        sx={{
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        }}
                      >
                        Upload Photo
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={1.5}>
                      {recentPhotos.map((photo) => (
                        <Grid item xs={6} key={photo.id}>
                          <Box
                            component="img"
                            src={photo.url}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': { 
                                transform: 'scale(1.05)',
                              }
                            }}
                            onClick={() => navigate('/photos')}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Profile Info */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                  src={userProfile?.photoURL}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: skillInfo.color,
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    boxShadow: `0 12px 30px ${skillInfo.color}30`,
                    border: '4px solid white',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {!userProfile?.photoURL && getInitials(userProfile?.displayName)}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {userProfile?.displayName || 'Golfer'}
                </Typography>
                
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 2,
                    py: 0.5,
                    borderRadius: '12px',
                    background: skillInfo.color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    mb: 2,
                  }}
                >
                  {skillInfo.label} Golfer
                </Box>
                
                {userProfile?.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {userProfile.location}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Skill Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={skillInfo.progress}
                  sx={{
                    height: 12,
                    borderRadius: '6px',
                    bgcolor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      background: skillInfo.color,
                      borderRadius: '6px',
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                  {skillInfo.progress}% Complete
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Recent Achievements */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Achievements
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>🏌️</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                        Welcome to GolfBuddy!
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Started your golf journey
                      </Typography>
                    </Box>
                  </Box>
                  
                  {stats.buddies > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>👥</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                          Social Golfer
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Connected with {stats.buddies} golfer{stats.buddies !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {stats.photos > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>📸</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                          Memory Keeper
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Shared {stats.photos} golf photo{stats.photos !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {userProfile?.bio && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      About Me
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: '#64748b' }}>
                      "{userProfile.bio}"
                    </Typography>
                  </Box>
                </>
              )}
              
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/settings')}
                sx={{
                  mt: 3,
                  py: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857, #059669)',
                  },
                }}
              >
                ✏️ Edit Profile
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
