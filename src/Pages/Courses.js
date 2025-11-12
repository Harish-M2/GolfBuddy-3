import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid, Card, CardContent, Typography, Button, TextField, MenuItem, 
  Select, InputLabel, FormControl, Box, CircularProgress, Alert,
  Chip, Paper, Divider, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Container, ThemeProvider
} from '@mui/material';
import { 
  LocationOn, Search, GolfCourse, Phone, DriveEta, 
  NavigateBefore, NavigateNext, FilterList, Favorite, FavoriteBorder,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  addFavoriteCourse, 
  removeFavoriteCourse, 
  getFavoriteCourses 
} from '../firebase/platformDatabase';
import { HoverCard } from '../Components/EnhancedComponents';
import { gradientText } from '../theme';

export function Courses() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(10);
  const [country, setCountry] = useState('UK');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [favoritesDialog, setFavoritesDialog] = useState(false);

  // Load favorite courses
  useEffect(() => {
    const loadFavorites = async () => {
      if (currentUser) {
        try {
          const favorites = await getFavoriteCourses(currentUser.uid);
          setFavoriteCourses(favorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    };
    loadFavorites();
  }, [currentUser]);

  // Check if course is favorited
  const isFavorited = (courseId) => {
    return favoriteCourses.some(fav => fav.place_id === courseId || fav.id === courseId);
  };

  // Toggle favorite
  const handleToggleFavorite = async (course) => {
    if (!currentUser) {
      setError('Please sign in to save favorite courses.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const courseId = course.place_id || course.id;
    const isFav = isFavorited(courseId);

    try {
      if (isFav) {
        await removeFavoriteCourse(currentUser.uid, courseId);
        setFavoriteCourses(prev => prev.filter(fav => 
          (fav.place_id || fav.id) !== courseId
        ));
        setSuccess('Removed from favorites');
      } else {
        await addFavoriteCourse(currentUser.uid, {
          ...course,
          place_id: courseId,
          id: courseId
        });
        setFavoriteCourses(prev => [...prev, { ...course, place_id: courseId, id: courseId }]);
        setSuccess('Added to favorites!');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites. Please try again.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSearch = async () => {
    if (!postcode.trim()) {
      setError('Please enter a valid postcode.');
      return;
    }

    setLoading(true);
    setError('');
    setCourses([]);
    setCurrentPage(1);

    try {
      const geocodeResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${postcode},${country}`
      );

      if (geocodeResponse.data.length === 0) {
        setError('Invalid postcode or country. Please try again.');
        setLoading(false);
        return;
      }

      const { lat, lon } = geocodeResponse.data[0];

      const response = await axios.get(
        'https://golf-course-finder.p.rapidapi.com/api/golf-clubs/',
        {
          params: {
            miles: radius,
            latitude: lat,
            longitude: lon,
          },
          headers: {
            'X-RapidAPI-Key': '90fd7a1297msha82ae66822b3251p110588jsnd0e41d094a19',
            'X-RapidAPI-Host': 'golf-course-finder.p.rapidapi.com',
          },
        }
      );

      const coursesData = response.data || [];
      setCourses(coursesData);
      
      // Show message if no courses found
      if (coursesData.length === 0) {
        setError('No golf courses found in this area. Try expanding your search radius.');
      }
    } catch (err) {
      console.error('Golf course search error:', err);
      setError('Failed to fetch golf courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const getCountryFlag = (countryCode) => {
    const flags = {
      'UK': '🇬🇧',
      'US': '🇺🇸', 
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'IN': '🇮🇳'
    };
    return flags[countryCode] || '🌍';
  };

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
            🏌️ Discover Golf Courses
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
            Find the perfect golf course near you for your next round
          </Typography>
          
          {currentUser && favoriteCourses.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Favorite />}
              onClick={() => setFavoritesDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: theme.muiTheme.shadows[4],
                '&:hover': {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #d97706 100%)',
                  boxShadow: theme.muiTheme.shadows[8],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              My Favorites ({favoriteCourses.length})
            </Button>
          )}
        </Box>

      {/* Enhanced Search Section */}
      <HoverCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
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
                Search Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find courses in your area
              </Typography>
            </Box>
          </Box>
        
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Postcode"
              variant="outlined"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g., SW1A 1AA"
              fullWidth
              InputProps={{
                startAdornment: <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                label="Country"
              >
                <MenuItem value="UK">{getCountryFlag('UK')} United Kingdom</MenuItem>
                <MenuItem value="US">{getCountryFlag('US')} United States</MenuItem>
                <MenuItem value="CA">{getCountryFlag('CA')} Canada</MenuItem>
                <MenuItem value="AU">{getCountryFlag('AU')} Australia</MenuItem>
                <MenuItem value="IN">{getCountryFlag('IN')} India</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Search Radius</InputLabel>
              <Select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                label="Search Radius"
              >
                <MenuItem value={5}>5 miles</MenuItem>
                <MenuItem value={10}>10 miles</MenuItem>
                <MenuItem value={20}>20 miles</MenuItem>
                <MenuItem value={30}>30 miles</MenuItem>
                <MenuItem value={50}>50 miles</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={loading}
              fullWidth
              size="large"
              data-testid="search-courses-button"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #047857 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(30, 64, 175, 0.3)'
                }
              }}
            >
              {loading ? 'Searching...' : 'Find Courses'}
            </Button>
          </Grid>
        </Grid>
        </CardContent>
      </HoverCard>

      {/* Error & Success Alerts */}
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

      {/* Results Header */}
      {courses.length > 0 && (
        <Box sx={{ mb: 3, maxWidth: 1400, mx: 'auto' }}>
          <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.8)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Found {courses.length} golf course{courses.length !== 1 ? 's' : ''} 
              {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Searching for courses...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Enhanced Results Grid */}
      {!loading && (
        <Grid container spacing={3} data-testid="courses-results-grid">
        {currentCourses.length > 0 ? (
          currentCourses.map((course, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={course.place_id || index}
              sx={{
                animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                '@keyframes slideUp': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <HoverCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-testid="course-card">
                  <Box sx={{ p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GolfCourse sx={{ color: '#059669', mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          flexGrow: 1
                        }}
                      >
                        {course.club_name}
                      </Typography>
                      {currentUser && (
                        <Tooltip title={isFavorited(course.place_id || course.id) ? "Remove from favorites" : "Add to favorites"}>
                          <IconButton 
                            onClick={() => handleToggleFavorite(course)}
                            aria-label={isFavorited(course.place_id || course.id) ? "remove from favorites" : "add to favorites"}
                            data-testid={isFavorited(course.place_id || course.id) ? "favorited" : "not-favorited"}
                            sx={{ 
                              color: isFavorited(course.place_id || course.id) ? '#dc2626' : 'text.secondary',
                              '&:hover': { 
                                color: '#dc2626',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            {isFavorited(course.place_id || course.id) ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 0, pb: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5, mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {course.address}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2.5, mb: 1 }}>
                        {course.city}{course.state && `, ${course.state}`}, {course.country}
                      </Typography>

                      {course.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {course.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        icon={<DriveEta />}
                        label={course.driving_range ? 'Has Range' : 'No Range'}
                        size="small"
                        color={course.driving_range ? 'success' : 'default'}
                        variant={course.driving_range ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </HoverCard>
              </Grid>
            ))
          ) : (
            !loading && courses.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 3
                }}>
                  <GolfCourse sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom data-testid="no-courses-message">
                    No courses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or location
                  </Typography>
                </Paper>
              </Grid>
            )
          )}
        </Grid>
      )}

      {/* Pagination */}
      {courses.length > coursesPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          mx: 2
        }}>
          <Paper sx={{ 
            p: 2, 
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                startIcon={<NavigateBefore />}
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>
              
              <Typography sx={{ px: 2, fontWeight: 600 }}>
                {currentPage} of {totalPages}
              </Typography>
              
              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                endIcon={<NavigateNext />}
                sx={{ borderRadius: 2 }}
              >
                Next
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Favorites Dialog */}
      <Dialog 
        open={favoritesDialog} 
        onClose={() => setFavoritesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Favorite sx={{ color: '#dc2626', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              My Favorite Courses
            </Typography>
          </Box>
          <IconButton onClick={() => setFavoritesDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {favoriteCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GolfCourse sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No favorite courses yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start searching and add courses to your favorites!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {favoriteCourses.map((course) => (
                <Grid item xs={12} sm={6} key={course.place_id || course.id}>
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <GolfCourse sx={{ color: '#059669', mr: 1, mt: 0.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {course.club_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {course.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {course.city}{course.state && `, ${course.state}`}
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={() => handleToggleFavorite(course)}
                          size="small"
                          sx={{ color: '#dc2626' }}
                        >
                          <Favorite />
                        </IconButton>
                      </Box>
                      
                      {course.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Phone sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {course.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {course.driving_range && (
                        <Chip 
                          icon={<DriveEta />}
                          label="Has Range"
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setFavoritesDialog(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
    </ThemeProvider>
  );
}