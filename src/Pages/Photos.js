import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, CardMedia, CardContent,
  Button, IconButton, Dialog, DialogContent, DialogActions,
  Fab, CircularProgress, Alert, TextField, Chip, Zoom, LinearProgress,
  ThemeProvider, useTheme as useMuiTheme
} from '@mui/material';
import {
  AddAPhoto, Close, Delete, CloudUpload, Image as ImageIcon,
  LocationOn, CalendarToday, ZoomIn
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { uploadGolfPhoto, getUserGolfPhotos, deleteGolfPhoto } from '../firebase/platformDatabase';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import { gradientText } from '../theme';

export function Photos() {
  const { currentUser, userProfile } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const loadPhotos = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userPhotos = await getUserGolfPhotos(currentUser.uid);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      const metadata = {
        caption: caption || 'Golf memory',
        location: location || '',
        userDisplayName: userProfile?.displayName || 'Unknown'
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Add timeout to prevent infinite spinning
      const uploadPromise = uploadGolfPhoto(currentUser.uid, file, metadata);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 20 seconds')), 20000)
      );

      const photoData = await Promise.race([uploadPromise, timeoutPromise]);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setPhotos(prev => [photoData, ...prev]);
      
      setSuccess('Photo uploaded successfully! 🎉');
      setTimeout(() => setSuccess(''), 4000);
      
      // Reset form
      setUploadDialog(false);
      setCaption('');
      setLocation('');
      setPreviewUrl(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      let errorMessage = 'Failed to upload photo. Please try again.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage access denied. Please update Firebase Storage Rules.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Check your internet connection and Firebase configuration.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 6000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      await deleteGolfPhoto(photo.id, currentUser.uid, photo.fileName);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      setOpenDialog(false);
      setSuccess('Photo deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo. Please try again.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOpenPhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenDialog(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.muiTheme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="info" sx={{ maxWidth: 400, borderRadius: 2 }}>
          Please sign in to view and upload golf photos.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading your golf memories..." />;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.muiTheme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 6,
      pb: 10
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
              ...gradientText(theme.muiTheme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            📸 My Golf Memories
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 500,
              mb: 2,
            }}
          >
            Share your best golf moments and memories
          </Typography>
          <Chip
            label={`${photos.length} ${photos.length === 1 ? 'Photo' : 'Photos'}`}
            sx={{
              background: theme.muiTheme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' 
                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.95rem',
              px: 1,
            }}
          />
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

        {/* Empty State */}
        {photos.length === 0 ? (
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
                background: theme.muiTheme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' 
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ImageIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No photos yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start capturing your golf memories!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddAPhoto />}
              onClick={() => setUploadDialog(true)}
              size="large"
              sx={{
                background: theme.muiTheme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: theme.muiTheme.shadows[4],
                '&:hover': {
                  boxShadow: theme.muiTheme.shadows[8],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Upload Your First Photo
            </Button>
          </Box>
        ) : (
          <>
            {/* Enhanced Photo Grid with Masonry-style Layout */}
            <Grid container spacing={3}>
              {photos.map((photo, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3} 
                  key={photo.id}
                  sx={{
                    animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                    '@keyframes slideUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <HoverCard
                    onClick={() => handleOpenPhoto(photo)}
                    sx={{ cursor: 'pointer', height: '100%' }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="240"
                        image={photo.url}
                        alt={photo.caption || 'Golf photo'}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      />
                      {/* Hover Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      >
                        <ZoomIn sx={{ fontSize: 48, color: 'white' }} />
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {photo.caption || 'Golf memory'}
                      </Typography>
                      {photo.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {photo.location}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formatDate(photo.uploadedAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </HoverCard>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Enhanced Floating Action Button */}
        <Zoom in={!uploadDialog}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              width: 64,
              height: 64,
              background: theme.muiTheme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: theme.muiTheme.shadows[12],
              '&:hover': {
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: '0 12px 40px rgba(30, 64, 175, 0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={() => setUploadDialog(true)}
          >
            <AddAPhoto sx={{ fontSize: 28 }} />
          </Fab>
        </Zoom>
      </Container>

      {/* Enhanced Upload Dialog */}
      <Dialog 
        open={uploadDialog} 
        onClose={() => {
          if (!uploading) {
            setUploadDialog(false);
            setPreviewUrl(null);
            setCaption('');
            setLocation('');
          }
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: theme.muiTheme.shadows[12],
          }
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Upload Golf Photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share your golf moment with others
              </Typography>
            </Box>
            <IconButton 
              onClick={() => {
                setUploadDialog(false);
                setPreviewUrl(null);
                setCaption('');
                setLocation('');
              }} 
              disabled={uploading}
              sx={{
                '&:hover': {
                  background: theme.muiTheme.palette.error.main + '20',
                  color: 'error.main',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Preview */}
          {previewUrl && (
            <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  maxHeight: 300, 
                  objectFit: 'cover',
                  display: 'block',
                }} 
              />
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this moment..."
              multiline
              rows={2}
              disabled={uploading}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where was this taken?"
              disabled={uploading}
              InputProps={{
                startAdornment: <LocationOn color="text.secondary" sx={{ mr: 1 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Uploading...
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 20,
                  backgroundColor: muiTheme.palette.text.disabled + '30',
                  '& .MuiLinearProgress-bar': {
                    background: theme.muiTheme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 20,
                  },
                }}
              />
            </Box>
          )}

          <Button
            component="label"
            variant="contained"
            fullWidth
            size="large"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            disabled={uploading}
            sx={{
              py: 1.75,
              borderRadius: 2,
              background: theme.muiTheme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              fontSize: '1rem',
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
            {uploading ? 'Uploading...' : previewUrl ? 'Upload This Photo' : 'Choose Photo'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                handleFileSelect(e);
                if (e.target.files[0]) {
                  handlePhotoUpload(e.target.files[0]);
                }
              }}
              disabled={uploading}
            />
          </Button>
        </Box>
      </Dialog>

      {/* Enhanced Photo View Dialog (Lightbox) */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: theme.muiTheme.shadows[12],
            maxHeight: '90vh',
          }
        }}
      >
        {selectedPhoto && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
              <IconButton
                onClick={() => setOpenDialog(false)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  zIndex: 1,
                  '&:hover': { 
                    bgcolor: 'white',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Close />
              </IconButton>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '70vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              
              {/* Photo Details Overlay */}
              <Box 
                sx={{ 
                  p: 4,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',
                  color: 'white',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {selectedPhoto.caption || 'Golf memory'}
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedPhoto.location && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 22, mr: 1.5, color: '#FFD700' }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedPhoto.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 22, mr: 1.5, color: '#FFD700' }} />
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatDate(selectedPhoto.uploadedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            <DialogActions 
              sx={{ 
                p: 3,
                background: 'rgba(255,255,255,0.98)',
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Button
                onClick={() => handleDeletePhoto(selectedPhoto)}
                startIcon={<Delete />}
                color="error"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    background: theme.muiTheme.palette.error.main + '10',
                  },
                }}
              >
                Delete Photo
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
