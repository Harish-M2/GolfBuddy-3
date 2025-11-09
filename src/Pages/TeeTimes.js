import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  Alert,
  FormControl,
  ThemeProvider,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add,
  Event,
  AccessTime,
  LocationOn,
  People,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  PersonAdd,
  CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import { theme } from '../theme';
import {
  createTeeTime,
  getUserTeeTimes,
  updateTeeTimeRSVP,
  updateTeeTime,
  deleteTeeTime,
  getUserBuddies
} from '../firebase/database';

export function TeeTimes() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [teeTimes, setTeeTimes] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0: Upcoming, 1: Past, 2: My Events
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTeeTime, setSelectedTeeTime] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    courseAddress: '',
    date: '',
    time: '',
    maxPlayers: 4,
    notes: '',
    invitedBuddies: []
  });

  // Load tee times and buddies
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      const [teeTimesData, buddiesData] = await Promise.all([
        getUserTeeTimes(currentUser.uid),
        getUserBuddies(currentUser.uid)
      ]);
      
      setTeeTimes(teeTimesData);
      setBuddies(buddiesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load tee times');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter tee times based on active tab
  const getFilteredTeeTimes = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 0: // Upcoming
        return teeTimes.filter(tt => {
          const teeTimeDate = new Date(`${tt.date} ${tt.time}`);
          return teeTimeDate >= now;
        });
      case 1: // Past
        return teeTimes.filter(tt => {
          const teeTimeDate = new Date(`${tt.date} ${tt.time}`);
          return teeTimeDate < now;
        });
      case 2: // My Events
        return teeTimes.filter(tt => tt.creatorId === currentUser?.uid);
      default:
        return teeTimes;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle buddy invitation toggle
  const handleToggleBuddy = (buddyId) => {
    setFormData(prev => ({
      ...prev,
      invitedBuddies: prev.invitedBuddies.includes(buddyId)
        ? prev.invitedBuddies.filter(id => id !== buddyId)
        : [...prev.invitedBuddies, buddyId]
    }));
  };

  // Create new tee time
  const handleCreateTeeTime = async () => {
    try {
      // Validation
      if (!formData.courseName || !formData.date || !formData.time) {
        setError('Please fill in all required fields');
        return;
      }

      await createTeeTime(currentUser.uid, formData);
      setSuccess('Tee time created successfully!');
      setCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error creating tee time:', err);
      setError('Failed to create tee time');
    }
  };

  // Update existing tee time
  const handleUpdateTeeTime = async () => {
    try {
      if (!selectedTeeTime) return;

      await updateTeeTime(selectedTeeTime.id, {
        courseName: formData.courseName,
        courseAddress: formData.courseAddress,
        date: formData.date,
        time: formData.time,
        maxPlayers: formData.maxPlayers,
        notes: formData.notes,
        invitedBuddies: formData.invitedBuddies
      });

      setSuccess('Tee time updated successfully!');
      setEditDialogOpen(false);
      setSelectedTeeTime(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error updating tee time:', err);
      setError('Failed to update tee time');
    }
  };

  // Delete tee time
  const handleDeleteTeeTime = async (teeTimeId) => {
    if (!window.confirm('Are you sure you want to delete this tee time?')) {
      return;
    }

    try {
      await deleteTeeTime(teeTimeId);
      setSuccess('Tee time deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting tee time:', err);
      setError('Failed to delete tee time');
    }
  };

  // Update RSVP
  const handleUpdateRSVP = async (teeTimeId, status) => {
    try {
      await updateTeeTimeRSVP(teeTimeId, currentUser.uid, status);
      setSuccess(`RSVP updated to ${status}!`);
      loadData();
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setError('Failed to update RSVP');
    }
  };

  // Open edit dialog
  const handleEditClick = (teeTime) => {
    setSelectedTeeTime(teeTime);
    setFormData({
      courseName: teeTime.courseName,
      courseAddress: teeTime.courseAddress || '',
      date: teeTime.date,
      time: teeTime.time,
      maxPlayers: teeTime.maxPlayers,
      notes: teeTime.notes || '',
      invitedBuddies: teeTime.invitedBuddies || []
    });
    setEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      courseName: '',
      courseAddress: '',
      date: '',
      time: '',
      maxPlayers: 4,
      notes: '',
      invitedBuddies: []
    });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get user's RSVP status
  const getUserRSVP = (teeTime) => {
    return teeTime.rsvps?.[currentUser?.uid]?.status || 'pending';
  };

  // Check if user is creator
  const isCreator = (teeTime) => {
    return teeTime.creatorId === currentUser?.uid;
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Alert severity="info">
          Please sign in to manage tee times.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredTeeTimes = getFilteredTeeTimes();

  return (
    <ThemeProvider theme={theme.muiTheme}>
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Tee Times
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              }
            }}
          >
            Schedule Tee Time
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Organize golf outings and invite your buddies to join you on the course
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: theme.muiTheme.shadows[2] }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem',
              py: 2
            }
          }}
        >
          <Tab 
            icon={<Badge badgeContent={teeTimes.filter(tt => new Date(`${tt.date} ${tt.time}`) >= new Date()).length} color="primary"><CalendarToday /></Badge>} 
            label="Upcoming" 
            iconPosition="start"
          />
          <Tab 
            icon={<Schedule />} 
            label="Past Events" 
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={teeTimes.filter(tt => tt.creatorId === currentUser?.uid).length} color="secondary"><Event /></Badge>} 
            label="My Events" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tee Time Cards */}
      {filteredTeeTimes.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 2,
            boxShadow: theme.muiTheme.shadows[2] 
          }}
        >
          <Event sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No tee times found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {activeTab === 0 && "Schedule your first tee time to get started!"}
            {activeTab === 1 && "You haven't played any rounds yet"}
            {activeTab === 2 && "You haven't created any tee times yet"}
          </Typography>
          {activeTab !== 1 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }
              }}
            >
              Schedule Tee Time
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTeeTimes.map((teeTime) => {
            const userRSVP = getUserRSVP(teeTime);
            const isOwner = isCreator(teeTime);
            const acceptedCount = Object.values(teeTime.rsvps || {}).filter(r => r.status === 'accepted').length;
            
            return (
              <Grid item xs={12} md={6} key={teeTime.id}>
                <HoverCard>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: theme.muiTheme.shadows[2]
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header with course name and actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                          {teeTime.courseName}
                        </Typography>
                        {isOwner && (
                          <Box>
                            <IconButton size="small" onClick={() => handleEditClick(teeTime)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteTeeTime(teeTime.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Date and Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Event sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {formatDate(teeTime.date)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {teeTime.time}
                        </Typography>
                      </Box>

                      {/* Location */}
                      {teeTime.courseAddress && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {teeTime.courseAddress}
                          </Typography>
                        </Box>
                      )}

                      {/* Players */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {acceptedCount} / {teeTime.maxPlayers} players
                        </Typography>
                      </Box>

                      {/* Participants */}
                      {teeTime.participants && teeTime.participants.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <AvatarGroup max={4}>
                            {teeTime.participants
                              .filter(p => p.status === 'accepted')
                              .map((participant) => (
                                <Tooltip 
                                  key={participant.userId} 
                                  title={participant.profile?.displayName || 'User'}
                                >
                                  <Avatar 
                                    src={participant.profile?.photoURL}
                                    alt={participant.profile?.displayName}
                                  >
                                    {participant.profile?.displayName?.[0]?.toUpperCase() || 'U'}
                                  </Avatar>
                                </Tooltip>
                              ))}
                          </AvatarGroup>
                        </Box>
                      )}

                      {/* Notes */}
                      {teeTime.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          {teeTime.notes}
                        </Typography>
                      )}

                      {/* RSVP Status */}
                      <Box sx={{ mt: 2 }}>
                        {userRSVP === 'accepted' && (
                          <Chip 
                            label="You're Going" 
                            color="success" 
                            icon={<CheckCircle />} 
                            size="small"
                          />
                        )}
                        {userRSVP === 'declined' && (
                          <Chip 
                            label="You Declined" 
                            color="error" 
                            icon={<Cancel />} 
                            size="small"
                          />
                        )}
                        {userRSVP === 'pending' && !isOwner && (
                          <Chip 
                            label="Pending Response" 
                            color="warning" 
                            icon={<Schedule />} 
                            size="small"
                          />
                        )}
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {!isOwner && userRSVP === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleUpdateRSVP(teeTime.id, 'accepted')}
                            sx={{ flex: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleUpdateRSVP(teeTime.id, 'declined')}
                            sx={{ flex: 1 }}
                          >
                            Decline
                          </Button>
                        </Box>
                      )}
                      {!isOwner && userRSVP === 'accepted' && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleUpdateRSVP(teeTime.id, 'declined')}
                          fullWidth
                        >
                          Cancel RSVP
                        </Button>
                      )}
                      {!isOwner && userRSVP === 'declined' && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleUpdateRSVP(teeTime.id, 'accepted')}
                          fullWidth
                        >
                          Change to Accept
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </HoverCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Tee Time Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Event sx={{ mr: 1, color: 'primary.main' }} />
            Schedule Tee Time
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              required
              fullWidth
            />
            
            <TextField
              label="Course Address (Optional)"
              name="courseAddress"
              value={formData.courseAddress}
              onChange={handleInputChange}
              fullWidth
            />
            
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Max Players</InputLabel>
              <Select
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                label="Max Players"
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />
            
            {/* Invite Buddies */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonAdd sx={{ mr: 1 }} />
                Invite Buddies ({formData.invitedBuddies.length})
              </Typography>
              {buddies.length === 0 ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No buddies to invite. Connect with golfers first!
                </Alert>
              ) : (
                <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {buddies.map((buddy) => (
                    <ListItem key={buddy.id} dense>
                      <ListItemAvatar>
                        <Avatar src={buddy.photoURL} alt={buddy.displayName}>
                          {buddy.displayName?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={buddy.displayName}
                        secondary={buddy.skillLevel}
                      />
                      <ListItemSecondaryAction>
                        <Checkbox
                          checked={formData.invitedBuddies.includes(buddy.id)}
                          onChange={() => handleToggleBuddy(buddy.id)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTeeTime}
            variant="contained"
            sx={{
              background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }
            }}
          >
            Create Tee Time
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tee Time Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit sx={{ mr: 1, color: 'primary.main' }} />
            Edit Tee Time
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              required
              fullWidth
            />
            
            <TextField
              label="Course Address (Optional)"
              name="courseAddress"
              value={formData.courseAddress}
              onChange={handleInputChange}
              fullWidth
            />
            
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Max Players</InputLabel>
              <Select
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleInputChange}
                label="Max Players"
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />
            
            {/* Invite Buddies */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonAdd sx={{ mr: 1 }} />
                Invited Buddies ({formData.invitedBuddies.length})
              </Typography>
              {buddies.length === 0 ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No buddies to invite.
                </Alert>
              ) : (
                <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {buddies.map((buddy) => (
                    <ListItem key={buddy.id} dense>
                      <ListItemAvatar>
                        <Avatar src={buddy.photoURL} alt={buddy.displayName}>
                          {buddy.displayName?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={buddy.displayName}
                        secondary={buddy.skillLevel}
                      />
                      <ListItemSecondaryAction>
                        <Checkbox
                          checked={formData.invitedBuddies.includes(buddy.id)}
                          onChange={() => handleToggleBuddy(buddy.id)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setEditDialogOpen(false); setSelectedTeeTime(null); resetForm(); }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateTeeTime}
            variant="contained"
            sx={{
              background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { background: theme.muiTheme.palette.mode === 'dark' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }
            }}
          >
            Update Tee Time
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ThemeProvider>
  );
}
