import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Tabs, Tab, Grid, Card, CardContent,
  Avatar, Button, Chip, Alert, Divider, Badge, ThemeProvider
} from '@mui/material';
import {
  People, PersonAdd, Send, Check, Close, Delete,
  LocationOn, Refresh, HourglassEmpty, Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  getBuddyRequests,
  getUserBuddies,
  acceptBuddyRequest,
  declineBuddyRequest,
  removeBuddy,
  getUserProfile
} from '../firebase/database';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import { gradientText } from '../theme';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function Buddies() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [buddies, setBuddies] = useState([]);
  
  const [actionLoading, setActionLoading] = useState({});

  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [requests, buddiesList] = await Promise.all([
        getBuddyRequests(currentUser.uid),
        getUserBuddies(currentUser.uid)
      ]);
      
      // Filter pending requests
      const pendingReceived = requests.received.filter(req => req.status === 'pending');
      const pendingSent = requests.sent.filter(req => req.status === 'pending');
      
      // Get user profiles for requests
      const receivedWithProfiles = await Promise.all(
        pendingReceived.map(async (req) => {
          try {
            const profile = await getUserProfile(req.fromUserId);
            return { ...req, senderProfile: profile };
          } catch (err) {
            console.error('Error loading sender profile:', err);
            return { ...req, senderProfile: null };
          }
        })
      );
      
      const sentWithProfiles = await Promise.all(
        pendingSent.map(async (req) => {
          try {
            const profile = await getUserProfile(req.toUserId);
            return { ...req, recipientProfile: profile };
          } catch (err) {
            console.error('Error loading recipient profile:', err);
            return { ...req, recipientProfile: null };
          }
        })
      );
      
      setIncomingRequests(receivedWithProfiles.filter(r => r.senderProfile));
      setSentRequests(sentWithProfiles.filter(r => r.recipientProfile));
      setBuddies(buddiesList);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load buddy data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  const handleAcceptRequest = async (requestId, fromUserId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      
      await acceptBuddyRequest(requestId, fromUserId, currentUser.uid);
      
      setSuccess('Buddy request accepted! 🎉');
      setTimeout(() => setSuccess(''), 4000);
      
      await loadAllData();
      
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept request. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      
      await declineBuddyRequest(requestId);
      
      setSuccess('Request declined.');
      setTimeout(() => setSuccess(''), 3000);
      
      await loadAllData();
      
    } catch (error) {
      console.error('Error declining request:', error);
      setError('Failed to decline request. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRemoveBuddy = async (buddyId, buddyName) => {
    if (!window.confirm(`Remove ${buddyName} from your buddies?`)) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [buddyId]: true }));
      
      await removeBuddy(currentUser.uid, buddyId);
      
      setSuccess(`${buddyName} removed from your buddies.`);
      setTimeout(() => setSuccess(''), 3000);
      
      await loadAllData();
      
    } catch (error) {
      console.error('Error removing buddy:', error);
      setError('Failed to remove buddy. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [buddyId]: false }));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getSkillColor = (skill) => {
    switch (skill?.toLowerCase()) {
      case 'beginner': return theme.muiTheme.palette.success.main;
      case 'intermediate': return theme.muiTheme.palette.warning.main;
      case 'advanced': return theme.muiTheme.palette.error.main;
      default: return theme.muiTheme.palette.text.disabled;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your buddies..." />;
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
          Please sign in to manage your golf buddies.
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
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 4,
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
            My Golf Buddies 👥
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
            Manage your connections and buddy requests
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: 2, boxShadow: theme.muiTheme.shadows[4] }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess('')}
            sx={{ mb: 3, borderRadius: 2, boxShadow: theme.muiTheme.shadows[4] }}
          >
            {success}
          </Alert>
        )}

        {/* Tabs */}
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 64,
                },
              }}
            >
              <Tab 
                icon={
                  <Badge badgeContent={incomingRequests.length} color="error">
                    <PersonAdd />
                  </Badge>
                } 
                label="Requests" 
                iconPosition="start"
              />
              <Tab 
                icon={
                  <Badge badgeContent={buddies.length} color="primary">
                    <People />
                  </Badge>
                } 
                label="My Buddies" 
                iconPosition="start"
              />
              <Tab 
                icon={
                  <Badge badgeContent={sentRequests.length} color="default">
                    <Send />
                  </Badge>
                } 
                label="Sent Requests" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab 1: Incoming Requests */}
          <TabPanel value={activeTab} index={0}>
            {incomingRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PersonAdd sx={{ fontSize: 80, color: theme.muiTheme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No pending requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When someone sends you a buddy request, it will appear here
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {incomingRequests.map((request, index) => {
                  const profile = request.senderProfile;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      <Card sx={{ background: (t) => t.palette.mode === "dark" ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", border: (t) => t.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.2)", boxShadow: 2, borderRadius: 3, transition: "all 0.3s", "<HoverCard>:hover": { boxShadow: 12, transform: "scale(1.02)" } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <Avatar
                              src={profile?.photoURL}
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: getSkillColor(profile?.skillLevel),
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {!profile?.photoURL && getInitials(profile?.displayName)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {profile?.displayName || 'Unknown User'}
                              </Typography>
                              {profile?.skillLevel && (
                                <Chip
                                  label={profile.skillLevel}
                                  size="small"
                                  sx={{
                                    bgcolor: getSkillColor(profile.skillLevel),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 22,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {profile?.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {profile.location}
                              </Typography>
                            </Box>
                          )}

                          {request.message && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mb: 2,
                                p: 1.5,
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: 2,
                                fontStyle: 'italic',
                              }}
                            >
                              "{request.message}"
                            </Typography>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<Check />}
                              onClick={() => handleAcceptRequest(request.id, request.fromUserId)}
                              disabled={actionLoading[request.id]}
                              sx={{
                                background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 2,
                                fontWeight: 600,
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<Close />}
                              onClick={() => handleDeclineRequest(request.id)}
                              disabled={actionLoading[request.id]}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                borderWidth: 2,
                              }}
                            >
                              Decline
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>

          {/* Tab 2: My Buddies */}
          <TabPanel value={activeTab} index={1}>
            {buddies.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <People sx={{ fontSize: 80, color: theme.muiTheme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No buddies yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start connecting with golfers to build your buddy list!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {buddies.map((buddy) => (
                  <Grid item xs={12} sm={6} md={4} key={buddy.id}>
                    <Card sx={{ background: (t) => t.palette.mode === "dark" ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", border: (t) => t.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.2)", boxShadow: 2, borderRadius: 3, transition: "all 0.3s", "<HoverCard>:hover": { boxShadow: 12, transform: "scale(1.02)" } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Avatar
                            src={buddy.photoURL}
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: getSkillColor(buddy.skillLevel),
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {!buddy.photoURL && getInitials(buddy.displayName)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {buddy.displayName}
                            </Typography>
                            {buddy.skillLevel && (
                              <Chip
                                label={buddy.skillLevel}
                                size="small"
                                sx={{
                                  bgcolor: getSkillColor(buddy.skillLevel),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {buddy.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {buddy.location}
                            </Typography>
                          </Box>
                        )}

                        {buddy.email && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            📧 {buddy.email}
                          </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ChatIcon />}
                            onClick={() => navigate('/chat')}
                            sx={{
                              background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.muiTheme.shadows[8],
                              },
                            }}
                          >
                            Message
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleRemoveBuddy(buddy.id, buddy.displayName)}
                            disabled={actionLoading[buddy.id]}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              borderWidth: 2,
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Tab 3: Sent Requests */}
          <TabPanel value={activeTab} index={2}>
            {sentRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Send sx={{ fontSize: 80, color: theme.muiTheme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No sent requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requests you send will appear here
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {sentRequests.map((request) => {
                  const profile = request.recipientProfile;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      <Card sx={{ background: (t) => t.palette.mode === "dark" ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", border: (t) => t.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.2)", boxShadow: 2, borderRadius: 3, transition: "all 0.3s", "<HoverCard>:hover": { boxShadow: 12, transform: "scale(1.02)" } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <Avatar
                              src={profile?.photoURL}
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: getSkillColor(profile?.skillLevel),
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {!profile?.photoURL && getInitials(profile?.displayName)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {profile?.displayName || 'Unknown User'}
                              </Typography>
                              {profile?.skillLevel && (
                                <Chip
                                  label={profile.skillLevel}
                                  size="small"
                                  sx={{
                                    bgcolor: getSkillColor(profile.skillLevel),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 22,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {profile?.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {profile.location}
                              </Typography>
                            </Box>
                          )}

                          <Chip
                            icon={<HourglassEmpty />}
                            label="Pending"
                            size="small"
                            sx={{
                              bgcolor: theme.muiTheme.palette.warning.main,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>
        </Card>

        {/* Refresh Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAllData}
            disabled={loading}
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
      </Container>
    </Box>
    </ThemeProvider>
  );
}
