import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, CardContent, Paper,
  Avatar, LinearProgress, Chip, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Button, IconButton
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
import { StatCard, GradientCard, HoverCard } from '../Components/EnhancedComponents';
import theme, { gradientText } from '../theme';

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
      background: theme.gradients.background,
      py: 6
    }}>
      <Container maxWidth="xl">
        {/* Enhanced Header with Animation */}
        <Box sx={{ 
          mb: 6,
          animation: 'fadeInDown 0.6s ease-out',
          '@keyframes fadeInDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h2" 
                component="h1"
                sx={{
                  fontWeight: 900,
                  ...gradientText(theme.gradients.primary),
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 0.5,
                }}
              >
                Dashboard 🏌️
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Welcome back, {userProfile?.displayName || 'Golfer'}! 👋
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 1.5,
                borderRadius: theme.radius.full,
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: theme.shadows.md,
                backdropFilter: 'blur(10px)',
              }}
            >
              <TrendingUp sx={{ color: skillInfo.color }} />
              <Box>
                <Typography variant="caption" sx={{ display: 'block', color: theme.colors.text.secondary }}>
                  Level
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {skillInfo.label}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={skillInfo.progress}
                sx={{
                  width: 80,
                  height: 8,
                  borderRadius: theme.radius.full,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${skillInfo.color}, ${skillInfo.color}80)`,
                    borderRadius: theme.radius.full,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards with Animation */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Group}
              title="Golf Buddies"
              value={stats.buddies}
              subtitle="Active connections"
              color={theme.colors.primary.main}
              trend={stats.buddies > 0 ? 15 : null}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Favorite}
              title="Favorite Courses"
              value={stats.favoriteCourses}
              subtitle="Saved locations"
              color={theme.colors.error}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Photo}
              title="Golf Photos"
              value={stats.photos}
              subtitle="Memories captured"
              color={theme.colors.accent.gold}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={EmojiEvents}
              title="Pending Requests"
              value={stats.pendingRequests}
              subtitle="New connections"
              color={theme.colors.secondary.main}
              trend={stats.pendingRequests > 0 ? 20 : null}
            />
          </Grid>

          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <GradientCard sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar 
                    src={userProfile?.photoURL}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: skillInfo.color,
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      boxShadow: theme.shadows.lg,
                      border: '4px solid white',
                    }}
                  >
                    {!userProfile?.photoURL && getInitials(userProfile?.displayName)}
                  </Avatar>
                  
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {userProfile?.displayName || 'Golfer'}
                  </Typography>
                  
                  <Chip 
                    label={skillInfo.label}
                    sx={{ 
                      bgcolor: skillInfo.color,
                      color: 'white',
                      fontWeight: 600,
                      mb: 2,
                      px: 2,
                      py: 0.5,
                    }}
                  />
                  
                  {userProfile?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 18, color: theme.colors.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {userProfile.location}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Skill Progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: skillInfo.color }}>
                      {skillInfo.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={skillInfo.progress}
                    sx={{
                      height: 12,
                      borderRadius: theme.radius.full,
                      bgcolor: 'rgba(0,0,0,0.08)',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${skillInfo.color}, ${skillInfo.color}80)`,
                        borderRadius: theme.radius.full,
                      }
                    }}
                  />
                </Box>

                {userProfile?.bio && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                      }}
                    >
                      "{userProfile.bio}"
                    </Typography>
                  </>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/settings')}
                  sx={{
                    mt: 3,
                    background: theme.gradients.primary,
                    borderRadius: theme.radius.lg,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: theme.shadows.md,
                    '&:hover': {
                      boxShadow: theme.shadows.lg,
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </GradientCard>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Recent Buddies */}
              <Grid item xs={12} lg={6}>
                <HoverCard sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Recent Buddies
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/golf')}
                        sx={{
                          background: theme.gradients.primary,
                          color: 'white',
                          '&:hover': {
                            background: theme.colors.primary.dark,
                          },
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    
                    {recentBuddies.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Group sx={{ fontSize: 48, color: theme.colors.text.disabled, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No buddies yet. Find some golfers!
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/golf')}
                          sx={{ mt: 2 }}
                        >
                          Find Buddies
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <List dense>
                          {recentBuddies.map((buddy) => (
                            <ListItem 
                              key={buddy.id} 
                              sx={{ 
                                px: 0,
                                py: 1.5,
                                borderRadius: theme.radius.md,
                                transition: theme.transitions.base,
                                '&:hover': {
                                  bgcolor: 'rgba(5, 150, 105, 0.05)',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  src={buddy.photoURL}
                                  sx={{ 
                                    bgcolor: theme.colors.primary.main,
                                    width: 44,
                                    height: 44,
                                  }}
                                >
                                  {getInitials(buddy.displayName)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {buddy.displayName}
                                  </Typography>
                                }
                                secondary={buddy.location}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          endIcon={<ArrowForward />}
                          onClick={() => navigate('/settings')}
                          sx={{ mt: 1 }}
                        >
                          View All Buddies
                        </Button>
                      </>
                    )}
                  </CardContent>
                </HoverCard>
              </Grid>

              {/* Recent Photos */}
              <Grid item xs={12} lg={6}>
                <HoverCard sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Recent Photos
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/photos')}
                        sx={{
                          background: theme.gradients.gold,
                          color: 'white',
                          '&:hover': {
                            background: theme.colors.accent.goldDark,
                          },
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    
                    {recentPhotos.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Photo sx={{ fontSize: 48, color: theme.colors.text.disabled, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No photos yet. Share your golf moments!
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/photos')}
                          sx={{ mt: 2 }}
                        >
                          Upload Photo
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Grid container spacing={1.5}>
                          {recentPhotos.map((photo) => (
                            <Grid item xs={6} key={photo.id}>
                              <Box
                                component="img"
                                src={photo.url}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: theme.radius.md,
                                  cursor: 'pointer',
                                  transition: theme.transitions.base,
                                  '&:hover': { 
                                    transform: 'scale(1.05)',
                                    boxShadow: theme.shadows.lg,
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
                          sx={{ mt: 2 }}
                        >
                          View All Photos
                        </Button>
                      </>
                    )}
                  </CardContent>
                </HoverCard>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <GradientCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Group />}
                          onClick={() => navigate('/golf')}
                          sx={{ 
                            py: 1.5,
                            borderWidth: 2,
                            borderRadius: theme.radius.lg,
                            fontWeight: 600,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
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
                            py: 1.5,
                            borderWidth: 2,
                            borderRadius: theme.radius.lg,
                            fontWeight: 600,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
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
                            py: 1.5,
                            borderWidth: 2,
                            borderRadius: theme.radius.lg,
                            fontWeight: 600,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
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
                            py: 1.5,
                            borderWidth: 2,
                            borderRadius: theme.radius.lg,
                            fontWeight: 600,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          View Settings
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </GradientCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
