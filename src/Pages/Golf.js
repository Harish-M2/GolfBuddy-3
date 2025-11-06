import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, Card, CardContent, Typography, Button, Select, MenuItem, 
  InputLabel, FormControl, TextField, Box, Chip, Avatar, Alert, 
  Divider, Container, IconButton, Badge
} from '@mui/material';
import { 
  PersonAdd, LocationOn, Schedule, Refresh, 
  Email, Phone, Star, FilterList, Search, Check
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getAllGolfBuddies, getFilteredGolfBuddies, sendBuddyRequest, getSentRequests } from '../firebase/database';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import theme, { gradientText } from '../theme';

export function Golf() {
  const { currentUser } = useAuth();
  const [skillLevel, setSkillLevel] = useState('');
  const [location, setLocation] = useState('');
  const [golfers, setGolfers] = useState([]);
  const [filteredGolfers, setFilteredGolfers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestLoading, setRequestLoading] = useState({});

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [users, requests] = await Promise.all([
        getAllGolfBuddies(),
        getSentRequests(currentUser.uid)
      ]);
      
      const validGolfers = users.filter(user => 
        user.id !== currentUser?.uid && 
        user.displayName && 
        user.skillLevel
      );
      
      setGolfers(validGolfers);
      setFilteredGolfers(validGolfers);
      setSentRequests(requests.map(req => req.recipientId));
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load golfers. Please refresh the page.`);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      let filtered;
      if (skillLevel || location) {
        filtered = await getFilteredGolfBuddies(skillLevel, location);
      } else {
        filtered = golfers;
      }
      
      const validGolfers = filtered.filter(user => 
        user.id !== currentUser?.uid &&
        user.displayName && 
        user.skillLevel
      );
      
      setFilteredGolfers(validGolfers);
      
    } catch (error) {
      console.error('Error filtering golfers:', error);
      setError('Failed to filter golfers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (golferId, golferName) => {
    if (!currentUser) {
      setError('Please sign in to send buddy requests.');
      return;
    }

    if (sentRequests.includes(golferId)) {
      setError('You have already sent a request to this golfer.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setRequestLoading(prev => ({ ...prev, [golferId]: true }));
      
      const message = `Hi ${golferName}! I'd like to be your golf buddy. Let's play together!`;
      
      await sendBuddyRequest(currentUser.uid, golferId, message);
      
      setSentRequests(prev => [...prev, golferId]);
      
      setSuccess(`Request sent to ${golferName}!`);
      setTimeout(() => setSuccess(''), 4000);
      
    } catch (error) {
      console.error('Error sending buddy request:', error);
      setError(`Failed to send request. Please try again.`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setRequestLoading(prev => ({ ...prev, [golferId]: false }));
    }
  };

  const getSkillColor = (skill) => {
    switch (skill?.toLowerCase()) {
      case 'beginner': return theme.colors.success;
      case 'intermediate': return theme.colors.warning;
      case 'advanced': return theme.colors.error;
      default: return theme.colors.text.disabled;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

  const isRequestSent = (golferId) => {
    return sentRequests.includes(golferId);
  };

  if (loading) {
    return <LoadingSpinner message="Finding golf buddies..." />;
  }

  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.gradients.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="info" sx={{ maxWidth: 400, borderRadius: theme.radius.lg }}>
          Please sign in to find golf buddies and send requests.
        </Alert>
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
          textAlign: 'center',
          mb: 6,
          animation: 'fadeInDown 0.6s ease-out',
          '@keyframes fadeInDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Typography 
            variant="h2" 
            component="h1"
            sx={{
              fontWeight: 900,
              ...gradientText(theme.gradients.primary),
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Find Your Golf Buddy ⛳
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.colors.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 500,
            }}
          >
            Connect with golfers in your area and improve your game together
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ 
              mb: 3,
              borderRadius: theme.radius.lg,
              boxShadow: theme.shadows.md,
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess('')}
            sx={{ 
              mb: 3,
              borderRadius: theme.radius.lg,
              boxShadow: theme.shadows.md,
            }}
          >
            {success}
          </Alert>
        )}

        {/* Enhanced Filter Section */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadows.card,
          mb: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radius.lg,
                  background: theme.gradients.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FilterList sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Filter Golfers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find the perfect match for your skill level
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Skill Level</InputLabel>
                  <Select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    label="Skill Level"
                    sx={{
                      borderRadius: theme.radius.lg,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Los Angeles"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.radius.lg,
                      '& fieldset': {
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Search />}
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{
                      background: theme.gradients.primary,
                      borderRadius: theme.radius.lg,
                      py: 1.75,
                      fontWeight: 600,
                      boxShadow: theme.shadows.md,
                      '&:hover': {
                        boxShadow: theme.shadows.lg,
                        transform: 'translateY(-2px)',
                      },
                      transition: theme.transitions.base,
                    }}
                  >
                    Search
                  </Button>
                  <IconButton
                    onClick={loadData}
                    disabled={loading}
                    sx={{
                      border: `2px solid ${theme.colors.primary.main}`,
                      color: theme.colors.primary.main,
                      '&:hover': {
                        background: `${theme.colors.primary.main}10`,
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.5s',
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mt: 3,
              pt: 3,
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Found {filteredGolfers.length} golfers
              </Typography>
              {(skillLevel || location) && (
                <Button
                  size="small"
                  onClick={() => {
                    setSkillLevel('');
                    setLocation('');
                    setFilteredGolfers(golfers);
                  }}
                  sx={{ 
                    color: theme.colors.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Results Section */}
        {filteredGolfers.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center',
            py: 8,
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: theme.gradients.glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <PersonAdd sx={{ fontSize: 60, color: theme.colors.primary.main }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No golfers found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or check back later for new members
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              sx={{
                borderWidth: 2,
                borderRadius: theme.radius.lg,
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredGolfers.map((golfer, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={golfer.id}
                sx={{
                  animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                  '@keyframes slideUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <HoverCard>
                  <CardContent sx={{ p: 3 }}>
                    {/* Golfer Header */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          golfer.available !== false ? (
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: theme.colors.success,
                                border: '2px solid white',
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          src={golfer.photoURL}
                          sx={{
                            width: 80,
                            height: 80,
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            bgcolor: getSkillColor(golfer.skillLevel),
                            boxShadow: theme.shadows.md,
                          }}
                        >
                          {!golfer.photoURL && getInitials(golfer.displayName)}
                        </Avatar>
                      </Badge>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {golfer.displayName}
                        </Typography>

                        <Chip
                          label={golfer.skillLevel || 'Beginner'}
                          size="small"
                          sx={{
                            bgcolor: getSkillColor(golfer.skillLevel),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            mb: 1,
                          }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: theme.colors.accent.gold }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getRandomRating()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Golfer Details */}
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {golfer.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 18, color: theme.colors.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">
                            {golfer.location}
                          </Typography>
                        </Box>
                      )}

                      {golfer.available !== false && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 18, color: theme.colors.success }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.colors.success,
                              fontWeight: 600,
                            }}
                          >
                            Available to play
                          </Typography>
                        </Box>
                      )}

                      {golfer.bio && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                          }}
                        >
                          "{golfer.bio}"
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Contact Info */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {golfer.email && (
                        <Chip
                          icon={<Email sx={{ fontSize: 16 }} />}
                          label="Email"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                      {golfer.phone && (
                        <Chip
                          icon={<Phone sx={{ fontSize: 16 }} />}
                          label="Phone"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>

                    {/* Action Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={isRequestSent(golfer.id) ? <Check /> : <PersonAdd />}
                      onClick={() => handleRequest(golfer.id, golfer.displayName)}
                      disabled={isRequestSent(golfer.id) || requestLoading[golfer.id]}
                      sx={{
                        background: isRequestSent(golfer.id) 
                          ? theme.colors.text.disabled 
                          : theme.gradients.primary,
                        borderRadius: theme.radius.lg,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: theme.shadows.md,
                        '&:hover': {
                          boxShadow: theme.shadows.lg,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: theme.colors.text.disabled,
                          color: 'white',
                        },
                        transition: theme.transitions.base,
                      }}
                    >
                      {requestLoading[golfer.id] 
                        ? 'Sending...' 
                        : isRequestSent(golfer.id) 
                        ? 'Request Sent' 
                        : 'Send Request'}
                    </Button>
                  </CardContent>
                </HoverCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
