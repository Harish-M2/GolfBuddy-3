import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, CardContent, TextField, Button,
  Avatar, Grid, Alert, Chip, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, List, ListItem, ListItemText,
  ListItemAvatar, ListItemSecondaryAction, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Badge, CircularProgress, Divider, ThemeProvider,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  Edit, Save, Cancel, LocationOn, Phone, Email,
  Notifications, CheckCircle, Schedule,
  Person, Close, PhotoCamera
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateUserProfile, 
  getBuddyRequests, 
  acceptBuddyRequest, 
  declineBuddyRequest,
  getUserProfile,
  getUserBuddies,
  removeBuddy,
  uploadProfilePicture
} from '../firebase/platformDatabase';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import { gradientText } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

function Settings() {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [requestsWithUsers, setRequestsWithUsers] = useState({ received: [], sent: [] });
  const [buddies, setBuddies] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [buddiesLoading, setBuddiesLoading] = useState(true);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [showBuddiesDialog, setShowBuddiesDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    skillLevel: '',
    bio: '',
    available: true,
    notifications: true
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        skillLevel: userProfile.skillLevel || '',
        bio: userProfile.bio || '',
        available: userProfile.available !== false,
        notifications: userProfile.notifications !== false
      });
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Handle profile picture upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(''), 4000);
      return;
    }

    try {
      setUploadingPhoto(true);
      setError('');
      
      console.log('Starting upload for user:', currentUser.uid);
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      // Add timeout to prevent infinite spinning
      const uploadPromise = uploadProfilePicture(currentUser.uid, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 20 seconds. Please check your internet connection and Firebase Storage configuration.')), 20000)
      );
      
      const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);
      console.log('Upload successful! URL:', downloadURL);
      
      setPhotoURL(downloadURL);
      
      // Update context
      await updateProfile();
      
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      console.error('Error details:', error.message, error.code);
      
      let errorMessage = error.message;
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage access denied. Please update Firebase Storage Rules in the console.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Check your internet connection and try again.';
      }
      
      setError(`Failed to upload photo: ${errorMessage}`);
      setTimeout(() => setError(''), 8000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadBuddyRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const requestsData = await getBuddyRequests(currentUser.uid);
      setRequests(requestsData);
      
      // Fetch user details for received requests
      const receivedWithUsers = await Promise.all(
        requestsData.received
          .filter(req => req.status === 'pending')
          .map(async (req) => {
            try {
              const userProfile = await getUserProfile(req.fromUserId);
              return { ...req, senderProfile: userProfile };
            } catch (error) {
              console.error('Error fetching user profile:', error);
              return { ...req, senderProfile: null };
            }
          })
      );
      
      setRequestsWithUsers({ 
        received: receivedWithUsers.filter(req => req.senderProfile), 
        sent: requestsData.sent 
      });
    } catch (error) {
      console.error('Error loading buddy requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  }, [currentUser]);

  const loadBuddies = useCallback(async () => {
    try {
      setBuddiesLoading(true);
      const buddiesData = await getUserBuddies(currentUser.uid);
      setBuddies(buddiesData);
    } catch (error) {
      console.error('Error loading buddies:', error);
    } finally {
      setBuddiesLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadBuddyRequests();
      loadBuddies();
    }
  }, [currentUser, loadBuddyRequests, loadBuddies]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      console.log('💾 Saving profile for user:', currentUser.uid);
      console.log('💾 Form data:', formData);
      
      setLoading(true);
      setError('');
      
      await updateUserProfile(currentUser.uid, formData);
      console.log('✅ Profile updated in database');
      
      // Refresh profile from context
      await updateProfile();
      console.log('✅ Profile refreshed in context');
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(`Failed to update profile: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        skillLevel: userProfile.skillLevel || '',
        bio: userProfile.bio || '',
        available: userProfile.available !== false,
        notifications: userProfile.notifications !== false
      });
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    // Re-populate form with latest profile data when entering edit mode
    console.log('✏️ Entering edit mode, current userProfile:', userProfile);
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        skillLevel: userProfile.skillLevel || '',
        bio: userProfile.bio || '',
        available: userProfile.available !== false,
        notifications: userProfile.notifications !== false
      });
      console.log('✏️ Form data populated for editing');
    }
    setIsEditing(true);
  };

  const handleRequestResponse = async (request, action) => {
    try {
      console.log('🤝 Handling buddy request response:', { 
        action, 
        requestId: request.id,
        from: request.fromUserId,
        to: currentUser.uid
      });
      
      if (action === 'accepted') {
        await acceptBuddyRequest(request.id, request.fromUserId, currentUser.uid);
        console.log('✅ Buddy request accepted');
        setSuccess(`You are now buddies with ${request.senderProfile?.displayName}!`);
      } else {
        await declineBuddyRequest(request.id);
        console.log('✅ Buddy request declined');
        setSuccess('Request declined.');
      }
      
      console.log('🔄 Reloading buddy requests and buddies...');
      await loadBuddyRequests();
      await loadBuddies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Failed to update request. Please try again.');
    }
  };

  const handleRemoveBuddy = async (buddyId, buddyName) => {
    if (!window.confirm(`Remove ${buddyName} from your buddies?`)) return;
    
    try {
      await removeBuddy(currentUser.uid, buddyId);
      await loadBuddies();
      setSuccess(`Removed ${buddyName} from your buddies.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing buddy:', error);
      setError('Failed to remove buddy. Please try again.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getSkillColor = (skill) => {
    switch (skill?.toLowerCase()) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

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
          Please sign in to access your profile settings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            ⚙️ Profile & Settings
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
            Manage your golf buddy profile and preferences
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.muiTheme.shadows[4],
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: theme.muiTheme.shadows[4],
            }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={8}>
            <HoverCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Profile Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Keep your golf profile up to date
                    </Typography>
                  </Box>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      sx={{
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                        boxShadow: theme.muiTheme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.muiTheme.shadows[8],
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 2,
                          px: 3,
                          fontWeight: 600,
                          boxShadow: theme.muiTheme.shadows[4],
                          '&:hover': {
                            boxShadow: theme.muiTheme.shadows[8],
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                          borderRadius: 2,
                          borderWidth: 2,
                          px: 3,
                          fontWeight: 600,
                          '&:hover': {
                            borderWidth: 2,
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Enhanced Avatar Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        component="label"
                        sx={{
                          background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          width: 40,
                          height: 40,
                          boxShadow: theme.muiTheme.shadows[4],
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: theme.muiTheme.shadows[8],
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PhotoCamera sx={{ fontSize: 20 }} />
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </IconButton>
                    }
                  >
                    <Avatar 
                      src={photoURL}
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        bgcolor: photoURL ? 'transparent' : getSkillColor(formData.skillLevel),
                        mr: 3,
                        border: `4px solid ${muiTheme.palette.primary.main}30`,
                        boxShadow: theme.muiTheme.shadows[2],
                      }}
                    >
                      {!photoURL && getInitials(formData.displayName)}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formData.displayName || 'Your Name'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                      {formData.email}
                    </Typography>
                    {uploadingPhoto && (
                      <Typography variant="body2" sx={{ 
                        display: 'block', 
                        mb: 1,
                        color: 'primary.main',
                        fontWeight: 600,
                      }}>
                        Uploading photo...
                      </Typography>
                    )}
                    {formData.skillLevel && (
                      <Chip 
                        label={formData.skillLevel.charAt(0).toUpperCase() + formData.skillLevel.slice(1)}
                        size="medium"
                        sx={{ 
                          bgcolor: getSkillColor(formData.skillLevel),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          px: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Enhanced Form Fields */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Person color="text.secondary" sx={{ mr: 1 }} />
                      }}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Email color="text.secondary" sx={{ mr: 1 }} />
                      }}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Phone color="text.secondary" sx={{ mr: 1 }} />
                      }}
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <LocationOn color="text.secondary" sx={{ mr: 1 }} />
                      }}
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
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Skill Level</InputLabel>
                      <Select
                        value={formData.skillLevel}
                        onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                        label="Skill Level"
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                          },
                        }}
                      >
                        <MenuItem value="beginner">🟢 Beginner</MenuItem>
                        <MenuItem value="intermediate">🟡 Intermediate</MenuItem>
                        <MenuItem value="advanced">🔴 Advanced</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      pt: 1,
                      pl: 2,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.available}
                            onChange={(e) => handleInputChange('available', e.target.checked)}
                            disabled={!isEditing}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: muiTheme.palette.success.main,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: muiTheme.palette.success.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 600 }}>
                            Available for golf
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell other golfers about yourself..."
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
                  <Grid item xs={12}>
                    <Box sx={{ pl: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notifications}
                            onChange={(e) => handleInputChange('notifications', e.target.checked)}
                            disabled={!isEditing}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'primary.main',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: muiTheme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 600 }}>
                            Enable notifications
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </HoverCard>
          </Grid>

          {/* Enhanced Buddy Requests Section */}
          <Grid item xs={12} md={4}>
            <HoverCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Buddy Requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending connections
                    </Typography>
                  </Box>
                  <Badge 
                    badgeContent={requests.received.length} 
                    sx={{
                      '& .MuiBadge-badge': {
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 700,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Notifications sx={{ color: 'primary.main' }} />
                    </Box>
                  </Badge>
                </Box>

                {requestsLoading ? (
                  <LoadingSpinner message="Loading requests..." />
                ) : (
                  <>
                    {requestsWithUsers.received.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No pending requests
                      </Typography>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {requestsWithUsers.received.slice(0, 3).map((request) => (
                          <ListItem key={request.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: '#1e40af' }}>
                                {request.senderProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={request.senderProfile?.displayName || 'Unknown User'}
                              secondary={request.message || 'Wants to be your golf buddy!'}
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRequestResponse(request, 'accepted')}
                                  sx={{ color: '#10b981' }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRequestResponse(request, 'declined')}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {(requestsWithUsers.received.length > 3 || requests.sent.length > 0) && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setShowRequestsDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        View All Requests
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </HoverCard>

            {/* Enhanced My Buddies */}
            <HoverCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      My Golf Buddies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your connections
                    </Typography>
                  </Box>
                  <Chip 
                    label={buddies.length} 
                    sx={{
                      background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  />
                </Box>

                {buddiesLoading ? (
                  <LoadingSpinner message="Loading buddies..." />
                ) : (
                  <>
                    {buddies.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No buddies yet. Send requests to connect!
                      </Typography>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {buddies.slice(0, 3).map((buddy) => (
                          <ListItem key={buddy.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: '#059669' }}>
                                {buddy.displayName?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={buddy.displayName || 'Unknown User'}
                              secondary={`${buddy.skillLevel || 'Beginner'} • ${buddy.location || 'Location not set'}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveBuddy(buddy.id, buddy.displayName)}
                                sx={{ color: '#ef4444' }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {buddies.length > 3 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setShowBuddiesDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        View All Buddies ({buddies.length})
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </HoverCard>

            {/* Enhanced Quick Stats */}
            <HoverCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Your Stats
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, ...gradientText(theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}>
                        {requests.sent.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Requests Sent
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: muiTheme.palette.success.main }}>
                        {buddies.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Golf Buddies
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Schedule sx={{ color: formData.available ? theme.muiTheme.palette.success.main : theme.muiTheme.palette.error.main, mr: 1 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ color: formData.available ? theme.muiTheme.palette.success.main : theme.muiTheme.palette.error.main, fontWeight: 700 }}
                  >
                    {formData.available ? 'Available to Play' : 'Currently Busy'}
                  </Typography>
                </Box>
              </CardContent>
            </HoverCard>
          </Grid>
        </Grid>

        {/* Requests Dialog */}
        <Dialog 
          open={showRequestsDialog} 
          onClose={() => setShowRequestsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            All Buddy Requests
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Received ({requestsWithUsers.received.length})
            </Typography>
            {requestsWithUsers.received.length === 0 ? (
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                No pending requests
              </Typography>
            ) : (
              <List sx={{ mb: 3 }}>
                {requestsWithUsers.received.map((request) => (
                  <ListItem key={request.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1e40af' }}>
                        {request.senderProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={request.senderProfile?.displayName || 'Unknown User'}
                      secondary={request.message || 'Wants to be your golf buddy!'}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleRequestResponse(request, 'accepted')}
                          sx={{ 
                            bgcolor: '#10b981',
                            '&:hover': { bgcolor: '#059669' }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRequestResponse(request, 'declined')}
                          sx={{ 
                            color: '#ef4444',
                            borderColor: '#ef4444',
                            '&:hover': { borderColor: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.04)' }
                          }}
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>
              Sent ({requests.sent.length})
            </Typography>
            {requests.sent.length === 0 ? (
              <Typography color="text.secondary">
                No sent requests
              </Typography>
            ) : (
              <List>
                {requests.sent.map((request) => (
                  <ListItem key={request.id}>
                    <ListItemText
                      primary={`Request sent`}
                      secondary={`Status: ${request.status}`}
                    />
                    <Chip 
                      label={request.status}
                      size="small"
                      color={request.status === 'accepted' ? 'success' : request.status === 'pending' ? 'warning' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRequestsDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Buddies Dialog */}
        <Dialog 
          open={showBuddiesDialog} 
          onClose={() => setShowBuddiesDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            My Golf Buddies ({buddies.length})
          </DialogTitle>
          <DialogContent>
            {buddies.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No buddies yet. Go to Find Buddies to connect with golfers!
              </Typography>
            ) : (
              <List>
                {buddies.map((buddy) => (
                  <ListItem key={buddy.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#059669' }}>
                        {buddy.displayName?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={buddy.displayName || 'Unknown User'}
                      secondary={
                        <>
                          <Chip label={buddy.skillLevel || 'Beginner'} size="small" sx={{ mr: 0.5 }} />
                          {buddy.location && ` • ${buddy.location}`}
                          {buddy.email && (
                            <Box component="div" sx={{ mt: 0.5 }}>
                              📧 {buddy.email}
                            </Box>
                          )}
                          {buddy.phone && (
                            <Box component="div">
                              📞 {buddy.phone}
                            </Box>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveBuddy(buddy.id, buddy.displayName)}
                        sx={{ color: '#ef4444' }}
                      >
                        <Close />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBuddiesDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Settings;