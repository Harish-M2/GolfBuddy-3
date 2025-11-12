import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Grid, Card, CardContent, Typography, Button, Select, MenuItem, 
  InputLabel, FormControl, TextField, Box, Chip, Avatar, Alert, 
  Divider, Container, IconButton, Badge, ThemeProvider, Paper,
  useTheme as useMuiTheme, Pagination, Skeleton, FormControlLabel,
  Switch, Autocomplete, CircularProgress
} from '@mui/material';
import { 
  PersonAdd, LocationOn, Schedule, Refresh, 
  Email, Phone, Star, FilterList, Search, Check, Tune,
  ViewList, ViewModule, Sort
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getPaginatedGolfBuddies, 
  getFilteredGolfBuddies, 
  sendBuddyRequest, 
  getSentRequests,
  searchGolfBuddies 
} from '../firebase/platformDatabase';
import LoadingSpinner from '../Components/LoadingSpinner';
import { gradientText } from '../theme';

// Constants for pagination
const ITEMS_PER_PAGE = 12;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Members' },
  { value: 'active', label: 'Most Active' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'skill', label: 'Skill Level' },
  { value: 'rating', label: 'Highest Rated' }
];

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

export function Golf() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const observerRef = useRef();
  
  // State management
  const [golfers, setGolfers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestLoading, setRequestLoading] = useState({});
  
  // Pagination & filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    skillLevel: '',
    location: '',
    searchTerm: '',
    sortBy: 'newest',
    availableOnly: false,
    hasPhoto: false
  });
  
  // UI State
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [infiniteScroll, setInfiniteScroll] = useState(true);

  // Load initial data
  const loadGolfers = useCallback(async (page = 1, reset = true) => {
    if (!currentUser) return;
    
    try {
      if (reset) {
        setLoading(true);
        setGolfers([]);
      } else {
        setLoadingMore(true);
      }
      
      setError('');
      
      // Get paginated results
      const result = await getPaginatedGolfBuddies({
        page,
        limit: ITEMS_PER_PAGE,
        filters: filters,
        lastDoc: reset ? null : lastDoc,
        excludeUserId: currentUser.uid
      });
      
      const [requests] = await Promise.all([
        getSentRequests(currentUser.uid)
      ]);
      
      if (reset) {
        setGolfers(result.users);
      } else {
        setGolfers(prev => [...prev, ...result.users]);
      }
      
      setTotalUsers(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / ITEMS_PER_PAGE));
      setHasNextPage(result.hasNextPage);
      setLastDoc(result.lastDoc);
      setSentRequests(requests.map(req => req.recipientId));
      
    } catch (error) {
      console.error('Error loading golfers:', error);
      setError('Failed to load golfers. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser, filters, lastDoc]);

  // Search functionality
  const handleSearch = useCallback(async (searchTerm) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      let results;
      if (searchTerm.trim()) {
        results = await searchGolfBuddies(searchTerm, {
          ...filters,
          excludeUserId: currentUser.uid,
          limit: ITEMS_PER_PAGE
        });
      } else {
        // Reset to paginated results
        results = await getPaginatedGolfBuddies({
          page: 1,
          limit: ITEMS_PER_PAGE,
          filters: filters,
          excludeUserId: currentUser.uid
        });
      }
      
      setGolfers(results.users);
      setTotalUsers(results.totalCount);
      setTotalPages(Math.ceil(results.totalCount / ITEMS_PER_PAGE));
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error searching golfers:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadGolfers(1, true);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !hasNextPage || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadGolfers(currentPage + 1, false);
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [infiniteScroll, hasNextPage, loadingMore, currentPage, loadGolfers]);

  // Initial load
  useEffect(() => {
    loadGolfers();
  }, []);

  // Send buddy request
  const handleRequest = async (golferId, golferName) => {
    if (!currentUser) {
      setError('Please sign in to send buddy requests.');
      return;
    }

    try {
      setRequestLoading(prev => ({ ...prev, [golferId]: true }));
      
      await sendBuddyRequest(currentUser.uid, golferId, userProfile?.displayName);
      
      setSentRequests(prev => [...prev, golferId]);
      setSuccess(`Buddy request sent to ${golferName}! 🎯`);
      setTimeout(() => setSuccess(''), 4000);
      
    } catch (error) {
      console.error('Error sending buddy request:', error);
      setError('Failed to send request. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setRequestLoading(prev => ({ ...prev, [golferId]: false }));
    }
  };

  const isRequestSent = (golferId) => sentRequests.includes(golferId);
  
  const getSkillColor = (skill) => {
    const colors = {
      beginner: '#22c55e',
      intermediate: '#f59e0b', 
      advanced: '#dc2626'
    };
    return colors[skill?.toLowerCase()] || '#6b7280';
  };

  const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);

  if (loading && golfers.length === 0) {
    return <LoadingSpinner />;
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
              Find Your Golf Buddy ⛳
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 500,
                mb: 2
              }}
            >
              Connect with {totalUsers.toLocaleString()} golfers worldwide
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

          {/* Enhanced Filter & Search Section */}
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
              {/* Header Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <Search sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Find Golfers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {totalUsers.toLocaleString()} members • Page {currentPage} of {totalPages}
                    </Typography>
                  </Box>
                </Box>

                {/* View Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={() => setViewMode(VIEW_MODES.GRID)}
                    color={viewMode === VIEW_MODES.GRID ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewModule />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode(VIEW_MODES.LIST)}
                    color={viewMode === VIEW_MODES.LIST ? 'primary' : 'default'}
                    size="small"
                  >
                    <ViewList />
                  </IconButton>
                  <IconButton
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    color={showAdvancedFilters ? 'primary' : 'default'}
                    size="small"
                  >
                    <Tune />
                  </IconButton>
                </Box>
              </Box>

              {/* Main Search & Filters */}
              <Grid container spacing={2} alignItems="center">
                {/* Search Bar */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, location, bio..."
                    value={filters.searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters(prev => ({ ...prev, searchTerm: value }));
                      // Debounced search
                      clearTimeout(window.searchTimeout);
                      window.searchTimeout = setTimeout(() => {
                        handleSearch(value);
                      }, 500);
                    }}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>

                {/* Quick Filters */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      value={filters.skillLevel}
                      onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                      label="Skill Level"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      label="Sort By"
                      sx={{ borderRadius: 2 }}
                    >
                      {SORT_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => loadGolfers(1, true)}
                      disabled={loading}
                      sx={{
                        background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        py: 1.75,
                        fontWeight: 600,
                      }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="e.g., Los Angeles"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filters.availableOnly}
                            onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Available to play"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filters.hasPhoto}
                            onChange={(e) => handleFilterChange('hasPhoto', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Has profile photo"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={infiniteScroll}
                            onChange={(e) => setInfiniteScroll(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Infinite scroll"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Results Summary */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mt: 3,
                pt: 3,
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Showing {golfers.length} of {totalUsers.toLocaleString()} golfers
                </Typography>
                
                {Object.values(filters).some(v => v) && (
                  <Button
                    size="small"
                    onClick={() => {
                      setFilters({
                        skillLevel: '',
                        location: '',
                        searchTerm: '',
                        sortBy: 'newest',
                        availableOnly: false,
                        hasPhoto: false
                      });
                      loadGolfers(1, true);
                    }}
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Results Section */}
          {golfers.length === 0 && !loading ? (
            <Box sx={{ 
              textAlign: 'center',
              py: 8,
              animation: 'fadeIn 0.5s ease-out',
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
                Try adjusting your filters or search terms
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => loadGolfers(1, true)}
                sx={{
                  borderWidth: 2,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Reset Search
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {golfers.map((golfer, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={viewMode === VIEW_MODES.LIST ? 12 : 6}
                    md={viewMode === VIEW_MODES.LIST ? 12 : 4}
                    lg={viewMode === VIEW_MODES.LIST ? 12 : 3}
                    key={golfer.id}
                    sx={{
                      animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                      '@keyframes slideUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <Card
                      sx={{
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
                          transform: 'scale(1.02)',
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
                      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                        {/* Card content - same as before but optimized */}
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
                              {!golfer.photoURL && golfer.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2)}
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

                        {/* Location & Status */}
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {golfer.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {golfer.location}
                              </Typography>
                            </Box>
                          )}

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

                        <Divider sx={{ my: 2 }} />

                        {/* Action Button */}
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={isRequestSent(golfer.id) ? <Check /> : <PersonAdd />}
                          onClick={() => handleRequest(golfer.id, golfer.displayName)}
                          disabled={isRequestSent(golfer.id) || requestLoading[golfer.id]}
                          sx={{
                            background: isRequestSent(golfer.id) 
                              ? theme.muiTheme.palette.success.main
                              : theme.muiTheme.palette.mode === 'dark' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              boxShadow: theme.muiTheme.shadows[8],
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: theme.muiTheme.palette.success.main,
                              color: 'white',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          {requestLoading[golfer.id] 
                            ? 'Sending...' 
                            : isRequestSent(golfer.id) 
                              ? 'Request Sent' 
                              : 'Send Request'
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                {/* Loading skeletons */}
                {loadingMore && (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                      <Card sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Skeleton variant="circular" width={80} height={80} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={28} />
                            <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 1, borderRadius: 1 }} />
                            <Skeleton variant="text" width="40%" height={20} />
                          </Box>
                        </Box>
                        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>

              {/* Infinite Scroll Trigger */}
              {infiniteScroll && hasNextPage && !loadingMore && (
                <Box ref={observerRef} sx={{ height: 20, mt: 4 }} />
              )}

              {/* Pagination */}
              {!infiniteScroll && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, page) => {
                      setCurrentPage(page);
                      loadGolfers(page, true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Load More Button (fallback) */}
              {!infiniteScroll && hasNextPage && !loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCurrentPage(prev => prev + 1);
                      loadGolfers(currentPage + 1, false);
                    }}
                    disabled={loadingMore}
                    sx={{
                      borderWidth: 2,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading...
                      </>
                    ) : (
                      'Load More Golfers'
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
