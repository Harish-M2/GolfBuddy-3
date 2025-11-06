import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, CardContent, Paper,
  Avatar, LinearProgress, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Button
} from '@mui/material';
import {
  Group, GolfCourse, Photo, EmojiEvents,
  LocationOn, Assessment, Favorite, TrendingUp,
  ArrowForward, Add
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
import { StatCard } from '../Components/EnhancedComponents';

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

        setRecentBuddies(buddies.slice(0, 5));
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
        rgba(59, 130, 246, 0.05) 0%, 
        rgba(16, 185, 129, 0.05) 25%,
        rgba(236, 72, 153, 0.05) 50%,
        rgba(251, 191, 36, 0.05) 75%,
        rgba(139, 92, 246, 0.05) 100%
      ), #fafbff`,
      py: { xs: 3, md: 6 },
      px: { xs: 2, md: 0 }
    }}>
      <Container maxWidth="xl">
        {/* Modern Header with Better Alignment */}
        <Box sx={{ 
          mb: { xs: 4, md: 6 },
          animation: 'fadeInDown 0.8s ease-out',
          '@keyframes fadeInDown': {
            from: { opacity: 0, transform: 'translateY(-30px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 2 }
          }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, width: '100%' }}>
              <Typography 
                variant="h1" 
                component="h1"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #1e40af, #059669, #dc2626)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  mb: 1,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Dashboard 🏌️
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'rgba(15, 23, 42, 0.7)',
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  letterSpacing: '0.01em',
                }}
              >
                Welcome back, <Box component="span" sx={{ fontWeight: 700, color: '#059669' }}>{userProfile?.displayName || 'Golfer'}</Box>! 👋
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                px: 4,
                py: 2,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                minWidth: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${skillInfo.color}, ${skillInfo.color}80)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 25px ${skillInfo.color}40`,
                }}
              >
                <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(15, 23, 42, 0.6)', 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Skill Level
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 800, 
                  color: skillInfo.color,
                  fontSize: '1rem',
                  mb: 0.5,
                }}>
                  {skillInfo.label}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={skillInfo.progress}
                  sx={{
                    width: 100,
                    height: 6,
                    borderRadius: '10px',
                    bgcolor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${skillInfo.color}, ${skillInfo.color}cc)`,
                      borderRadius: '10px',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Enhanced Stats Cards Section */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3, 
              color: '#1e293b',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            📊 Your Golf Stats
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  animation: 'slideUp 0.6s ease-out 0.1s both',
                  '@keyframes slideUp': {
                    from: { transform: 'translateY(30px)', opacity: 0 },
                    to: { transform: 'translateY(0)', opacity: 1 },
                  },
                }}
              >
                <StatCard
                  icon={Group}
                  title="Golf Buddies"
                  value={stats.buddies}
                  subtitle="Active connections"
                  color="#059669"
                  trend={stats.buddies > 0 ? 15 : null}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  animation: 'slideUp 0.6s ease-out 0.2s both',
                  '@keyframes slideUp': {
                    from: { transform: 'translateY(30px)', opacity: 0 },
                    to: { transform: 'translateY(0)', opacity: 1 },
                  },
                }}
              >
                <StatCard
                  icon={Favorite}
                  title="Favorite Courses"
                  value={stats.favoriteCourses}
                  subtitle="Saved locations"
                  color="#dc2626"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  animation: 'slideUp 0.6s ease-out 0.3s both',
                  '@keyframes slideUp': {
                    from: { transform: 'translateY(30px)', opacity: 0 },
                    to: { transform: 'translateY(0)', opacity: 1 },
                  },
                }}
              >
                <StatCard
                  icon={Photo}
                  title="Golf Photos"
                  value={stats.photos}
                  subtitle="Memories captured"
                  color="#f59e0b"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  animation: 'slideUp 0.6s ease-out 0.4s both',
                  '@keyframes slideUp': {
                    from: { transform: 'translateY(30px)', opacity: 0 },
                    to: { transform: 'translateY(0)', opacity: 1 },
                  },
                }}
              >
                <StatCard
                  icon={EmojiEvents}
                  title="Pending Requests"
                  value={stats.pendingRequests}
                  subtitle="New connections"
                  color="#8b5cf6"
                  trend={stats.pendingRequests > 0 ? 20 : null}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }}>

          {/* Enhanced Profile Card */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                animation: 'slideUp 0.6s ease-out 0.5s both',
                '@keyframes slideUp': {
                  from: { transform: 'translateY(30px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 },
                },
              }}
            >
              <Paper
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15), 0 12px 30px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                      <Avatar 
                        src={userProfile?.photoURL}
                        sx={{
                          width: 140,
                          height: 140,
                          bgcolor: skillInfo.color,
                          fontSize: '3rem',
                          fontWeight: 'bold',
                          boxShadow: `0 15px 40px ${skillInfo.color}30, 0 8px 20px rgba(0, 0, 0, 0.1)`,
                          border: '5px solid white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: `0 20px 50px ${skillInfo.color}40, 0 10px 25px rgba(0, 0, 0, 0.15)`,
                          },
                        }}
                      >
                        {!userProfile?.photoURL && getInitials(userProfile?.displayName)}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: '#10b981',
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 1,
                        background: 'linear-gradient(135deg, #1e293b, #374151)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {userProfile?.displayName || 'Golfer'}
                    </Typography>
                    
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 3,
                        py: 1,
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${skillInfo.color}, ${skillInfo.color}cc)`,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        mb: 2,
                        boxShadow: `0 8px 20px ${skillInfo.color}40`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {skillInfo.label}
                    </Box>
                    
                    {userProfile?.location && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 1,
                        px: 3,
                        py: 1,
                        borderRadius: '12px',
                        background: 'rgba(15, 23, 42, 0.05)',
                      }}>
                        <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                          {userProfile.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 3, bgcolor: 'rgba(15, 23, 42, 0.1)' }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#374151' }}>
                        Skill Progress
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: skillInfo.color }}>
                        {skillInfo.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skillInfo.progress}
                      sx={{
                        height: 16,
                        borderRadius: '10px',
                        bgcolor: 'rgba(15, 23, 42, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(135deg, ${skillInfo.color}, ${skillInfo.color}cc)`,
                          borderRadius: '10px',
                          boxShadow: `0 4px 12px ${skillInfo.color}30`,
                        }
                      }}
                    />
                  </Box>

                  {userProfile?.bio && (
                    <>
                      <Divider sx={{ my: 3, bgcolor: 'rgba(15, 23, 42, 0.1)' }} />
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                          mb: 2,
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontStyle: 'italic',
                            lineHeight: 1.7,
                            color: '#475569',
                            textAlign: 'center',
                          }}
                        >
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
                      mt: 2,
                      py: 2,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 10px 30px rgba(5, 150, 105, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 40px rgba(5, 150, 105, 0.4)',
                        background: 'linear-gradient(135deg, #047857, #059669)',
                      },
                    }}
                  >
                    ✏️ Edit Profile
                  </Button>
                </CardContent>
              </Paper>
            </Box>
          </Grid>

          {/* Enhanced Recent Activity */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
              {/* Recent Buddies */}
              <Grid item xs={12} lg={6}>
                <Box
                  sx={{
                    animation: 'slideUp 0.6s ease-out 0.6s both',
                    '@keyframes slideUp': {
                      from: { transform: 'translateY(30px)', opacity: 0 },
                      to: { transform: 'translateY(0)', opacity: 1 },
                    },
                  }}
                >
                  <Paper
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Group sx={{ color: '#059669', fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Recent Buddies
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => navigate('/golf')}
                          sx={{
                            minWidth: 'auto',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: 'white',
                            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.3)',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4)',
                            },
                          }}
                        >
                          <Add sx={{ fontSize: 20 }} />
                        </Button>
                      </Box>
                      
                      {recentBuddies.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.1))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <Group sx={{ fontSize: 36, color: '#059669' }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                            No buddies yet
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                            Start connecting with golfers!
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => navigate('/golf')}
                            sx={{
                              borderRadius: '12px',
                              px: 4,
                              py: 1.5,
                              background: 'linear-gradient(135deg, #059669, #10b981)',
                              fontWeight: 600,
                              textTransform: 'none',
                            }}
                          >
                            Find Buddies
                          </Button>
                        </Box>
                      ) : (
                        <>
                          <List sx={{ py: 0 }}>
                            {recentBuddies.map((buddy, index) => (
                              <ListItem 
                                key={buddy.id} 
                                sx={{ 
                                  px: 0,
                                  py: 2,
                                  borderRadius: '12px',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(5, 150, 105, 0.05)',
                                    transform: 'translateX(4px)',
                                  },
                                  ...(index !== recentBuddies.length - 1 && {
                                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                                  }),
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar 
                                    src={buddy.photoURL}
                                    sx={{ 
                                      bgcolor: '#059669',
                                      width: 48,
                                      height: 48,
                                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {getInitials(buddy.displayName)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                      {buddy.displayName}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                      {buddy.location || 'Location not set'}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            endIcon={<ArrowForward />}
                            onClick={() => navigate('/buddies')}
                            sx={{ 
                              mt: 2,
                              py: 1.5,
                              borderRadius: '12px',
                              borderWidth: 2,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                borderWidth: 2,
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            View All Buddies
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Paper>
                </Box>
              </Grid>

              {/* Recent Photos */}
              <Grid item xs={12} lg={6}>
                <Box
                  sx={{
                    animation: 'slideUp 0.6s ease-out 0.7s both',
                    '@keyframes slideUp': {
                      from: { transform: 'translateY(30px)', opacity: 0 },
                      to: { transform: 'translateY(0)', opacity: 1 },
                    },
                  }}
                >
                  <Paper
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Photo sx={{ color: '#f59e0b', fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Recent Photos
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => navigate('/photos')}
                          sx={{
                            minWidth: 'auto',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                            color: 'white',
                            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                            },
                          }}
                        >
                          <Add sx={{ fontSize: 20 }} />
                        </Button>
                      </Box>
                      
                      {recentPhotos.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <Photo sx={{ fontSize: 36, color: '#f59e0b' }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                            No photos yet
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                            Share your golf moments!
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => navigate('/photos')}
                            sx={{
                              borderRadius: '12px',
                              px: 4,
                              py: 1.5,
                              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                              fontWeight: 600,
                              textTransform: 'none',
                            }}
                          >
                            Upload Photo
                          </Button>
                        </Box>
                      ) : (
                        <>
                          <Grid container spacing={2}>
                            {recentPhotos.map((photo, index) => (
                              <Grid item xs={6} key={photo.id}>
                                <Box
                                  component="img"
                                  src={photo.url}
                                  sx={{
                                    width: '100%',
                                    height: 120,
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                                    '&:hover': { 
                                      transform: 'scale(1.05) rotate(1deg)',
                                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                                    }
                                  }}
                                  onClick={() => navigate('/photos')}
                                />
                              </Grid>
                            ))}
                          </Grid>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            endIcon={<ArrowForward />}
                            onClick={() => navigate('/photos')}
                            sx={{ 
                              mt: 3,
                              py: 1.5,
                              borderRadius: '12px',
                              borderWidth: 2,
                              fontWeight: 600,
                              textTransform: 'none',
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: '#f59e0b',
                                background: 'rgba(245, 158, 11, 0.05)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            View All Photos
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Paper>
                </Box>
              </Grid>

              {/* Enhanced Quick Actions */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    animation: 'slideUp 0.6s ease-out 0.8s both',
                    '@keyframes slideUp': {
                      from: { transform: 'translateY(30px)', opacity: 0 },
                      to: { transform: 'translateY(0)', opacity: 1 },
                    },
                  }}
                >
                  <Paper
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '24px',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <Assessment sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                          ⚡ Quick Actions
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Group />}
                            onClick={() => navigate('/golf')}
                            sx={{ 
                              py: 2,
                              borderWidth: 2,
                              borderRadius: '16px',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              borderColor: '#059669',
                              color: '#059669',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: '#059669',
                                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.05))',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 30px rgba(5, 150, 105, 0.2)',
                              },
                            }}
                          >
                            Find Buddies
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GolfCourse />}
                            onClick={() => navigate('/courses')}
                            sx={{ 
                              py: 2,
                              borderWidth: 2,
                              borderRadius: '16px',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: '#3b82f6',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.05))',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.2)',
                              },
                            }}
                          >
                            Search Courses
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Photo />}
                            onClick={() => navigate('/photos')}
                            sx={{ 
                              py: 2,
                              borderWidth: 2,
                              borderRadius: '16px',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: '#f59e0b',
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 30px rgba(245, 158, 11, 0.2)',
                              },
                            }}
                          >
                            Upload Photo
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Assessment />}
                            onClick={() => navigate('/settings')}
                            sx={{ 
                              py: 2,
                              borderWidth: 2,
                              borderRadius: '16px',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '1rem',
                              borderColor: '#8b5cf6',
                              color: '#8b5cf6',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: '#8b5cf6',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05))',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 30px rgba(139, 92, 246, 0.2)',
                              },
                            }}
                          >
                            View Settings
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
