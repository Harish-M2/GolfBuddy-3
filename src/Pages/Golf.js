import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, Card, CardContent, Typography, Button, Select, MenuItem, 
  InputLabel, FormControl, TextField, Box, Chip, Avatar, Alert, 
  Divider, Container, IconButton, Badge, ThemeProvider,
  useTheme as useMuiTheme, Pagination, Stack
} from '@mui/material';
import { 
  PersonAdd, LocationOn, Schedule, Refresh, 
  Email, Phone, Star, FilterList, Search, Check
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAllGolfBuddies, getFilteredGolfBuddies, sendBuddyRequest, getSentRequests } from '../firebase/database';
import LoadingSpinner from '../Components/LoadingSpinner';
import { gradientText } from '../theme';

export function Golf() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [skillLevel, setSkillLevel] = useState('');
  const [location, setLocation] = useState('');
  const [golfers, setGolfers] = useState([]);
  const [filteredGolfers, setFilteredGolfers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestLoading, setRequestLoading] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9); // Show 9 users per page (3 rows of 3)

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
      setPage(1); // Reset to first page when searching
      
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
      case 'beginner': return theme.muiTheme.palette.success.main;
      case 'intermediate': return theme.muiTheme.palette.warning.main;
      case 'advanced': return theme.muiTheme.palette.error.main;
      default: return theme.muiTheme.palette.text.disabled;
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
        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="info" sx={{ maxWidth: 400, borderRadius: 2 }}>
          Please sign in to find golf buddies and send requests.
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme.muiTheme}>
      <Box sx={{ 
      minHeight: '100vh',
      background: 'background.default',
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
              ...gradientText(theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Find Your Golf Buddy ⛳
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
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
              borderRadius: 2,
              boxShadow: theme.muiTheme.shadows[4],
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
              borderRadius: 2,
              boxShadow: theme.muiTheme.shadows[4],
            }}
          >
            {success}
          </Alert>
        )}

        {/* Enhanced Filter Section */}
        <Card sx={{
          background: theme.muiTheme.palette.mode === 'dark' 
            ? 'rgba(30, 30, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: theme.muiTheme.shadows[2],
          mb: 4,
          border: theme.muiTheme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                      borderRadius: 2,
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
                      borderRadius: 2,
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
                      background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      py: 1.75,
                      fontWeight: 600,
                      boxShadow: theme.muiTheme.shadows[4],
                      '&:hover': {
                        boxShadow: theme.muiTheme.shadows[8],
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Search
                  </Button>
                  <IconButton
                    onClick={loadData}
                    disabled={loading}
                    sx={{
                      border: `2px solid ${muiTheme.palette.primary.main}`,
                      color: 'primary.main',
                      '&:hover': {
                        background: `${muiTheme.palette.primary.main}10`,
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
                    setPage(1); // Reset to first page
                  }}
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Results Summary & Pagination Info */}
        {filteredGolfers.length > 0 && (
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Showing {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, filteredGolfers.length)} of {filteredGolfers.length} golfers
            </Typography>
            <Chip 
              label={`Page ${page} of ${Math.ceil(filteredGolfers.length / itemsPerPage)}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

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
                background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <PersonAdd sx={{ fontSize: 60, color: 'primary.main' }} />
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
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <>
          <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ mb: 2 }}>
            {filteredGolfers
              .slice((page - 1) * itemsPerPage, page * itemsPerPage)
              .map((golfer, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={golfer.id}
                sx={{
                  display: 'flex',
                  animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                  '@keyframes slideUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    height: 480,
                    display: 'flex',
                    flexDirection: 'column',
                    background: (t) => t.palette.mode === 'dark' 
                      ? 'rgba(30, 30, 30, 0.95)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: (t) => t.palette.mode === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: theme.muiTheme?.shadows[2] || '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: theme.muiTheme?.shadows[12] || '0 8px 32px rgba(0,0,0,0.12)',
                      transform: 'translateY(-4px) scale(1.01)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      opacity: 0,
                      transition: 'all 0.2s ease-in-out',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    },
                  }}
                >
                  <CardContent sx={{ 
                    p: 3, 
                    position: 'relative', 
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}>
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
                                bgcolor: muiTheme.palette.success.main,
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
                            boxShadow: theme.muiTheme.shadows[4],
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
                          <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getRandomRating()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Golfer Details */}
                    <Box sx={{ 
                      mb: 1.5, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1,
                      flex: 1,
                      minHeight: 120,
                      maxHeight: 140,
                      overflow: 'hidden',
                    }}>
                      <Box sx={{ height: 24 }}>
                        {golfer.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {golfer.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ height: 24 }}>
                        {golfer.available !== false && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 18, color: muiTheme.palette.success.main }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: muiTheme.palette.success.main,
                                fontWeight: 600,
                              }}
                            >
                              Available to play
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ flex: 1 }}>
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
                    </Box>

                    <Divider sx={{ my: 2, mt: 'auto' }} />

                    {/* Contact Info */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mb: 2, 
                      flexWrap: 'wrap',
                      minHeight: 32,
                      alignItems: 'center',
                    }}>
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
                          ? theme.muiTheme.palette.text.disabled 
                          : theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: theme.muiTheme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.muiTheme.shadows[8],
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: muiTheme.palette.text.disabled,
                          color: 'white',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {requestLoading[golfer.id] 
                        ? 'Sending...' 
                        : isRequestSent(golfer.id) 
                        ? 'Request Sent' 
                        : 'Send Request'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          {filteredGolfers.length > itemsPerPage && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 6,
              mb: 2
            }}>
              <Stack spacing={2}>
                <Pagination 
                  count={Math.ceil(filteredGolfers.length / itemsPerPage)}
                  page={page}
                  onChange={(event, value) => {
                    setPage(value);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 600,
                      fontSize: '1rem',
                      minWidth: 40,
                      height: 40,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        background: theme.muiTheme.palette.mode === 'dark' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        '&:hover': {
                          background: theme.muiTheme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }
                      }
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ textAlign: 'center', fontWeight: 500 }}
                >
                  {filteredGolfers.length} total golfers available
                </Typography>
              </Stack>
            </Box>
          )}
          </>
        )}
      </Container>
    </Box>
    </ThemeProvider>
  );
}
