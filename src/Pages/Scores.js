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
  Alert,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  EmojiEvents,
  TrendingUp,
  TrendingDown,
  Flag,
  Score as ScoreIcon,
  CalendarToday,
  Person,
  LocalFireDepartment,
  Star,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../Components/LoadingSpinner';
import { HoverCard } from '../Components/EnhancedComponents';
import { theme } from '../theme';
import {
  createScorecard,
  getUserScorecards,
  updateScorecard,
  deleteScorecard,
  getScorecardStats
} from '../firebase/database';

export function Scores() {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [scorecards, setScorecards] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Recent Rounds, 1: Statistics
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    date: '',
    totalPar: 72,
    holes: Array(18).fill(null).map((_, index) => ({
      number: index + 1,
      par: index < 4 || (index >= 9 && index < 13) ? 4 : (index === 4 || index === 13 ? 5 : 3),
      score: 0,
      putts: 0
    }))
  });

  // Load scorecards and stats
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      const [scorecardsData, statsData] = await Promise.all([
        getUserScorecards(currentUser.uid),
        getScorecardStats(currentUser.uid)
      ]);
      
      setScorecards(scorecardsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load scorecards');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle hole score change
  const handleHoleChange = (holeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      holes: prev.holes.map((hole, idx) => 
        idx === holeIndex ? { ...hole, [field]: parseInt(value) || 0 } : hole
      )
    }));
  };

  // Calculate total score
  const calculateTotalScore = (holes) => {
    return holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  };

  // Calculate total putts
  const calculateTotalPutts = (holes) => {
    return holes.reduce((sum, hole) => sum + (hole.putts || 0), 0);
  };

  // Calculate score relative to par
  const calculateRelativeToPar = (totalScore, totalPar) => {
    const diff = totalScore - totalPar;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  // Create new scorecard
  const handleCreateScorecard = async () => {
    try {
      // Validation
      if (!formData.courseName || !formData.date) {
        setError('Please fill in all required fields');
        return;
      }

      const totalScore = calculateTotalScore(formData.holes);
      const totalPutts = calculateTotalPutts(formData.holes);

      await createScorecard(currentUser.uid, {
        ...formData,
        totalScore,
        totalPutts,
        relativeToPar: calculateRelativeToPar(totalScore, formData.totalPar)
      });

      setSuccess('Scorecard saved successfully!');
      setCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error creating scorecard:', err);
      setError('Failed to save scorecard');
    }
  };

  // Update existing scorecard
  const handleUpdateScorecard = async () => {
    try {
      if (!selectedScorecard) return;

      const totalScore = calculateTotalScore(formData.holes);
      const totalPutts = calculateTotalPutts(formData.holes);

      await updateScorecard(selectedScorecard.id, {
        ...formData,
        totalScore,
        totalPutts,
        relativeToPar: calculateRelativeToPar(totalScore, formData.totalPar)
      });

      setSuccess('Scorecard updated successfully!');
      setEditDialogOpen(false);
      setSelectedScorecard(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error updating scorecard:', err);
      setError('Failed to update scorecard');
    }
  };

  // Delete scorecard
  const handleDeleteScorecard = async (scorecardId) => {
    if (!window.confirm('Are you sure you want to delete this scorecard?')) {
      return;
    }

    try {
      await deleteScorecard(scorecardId);
      setSuccess('Scorecard deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting scorecard:', err);
      setError('Failed to delete scorecard');
    }
  };

  // Open edit dialog
  const handleEditClick = (scorecard) => {
    setSelectedScorecard(scorecard);
    setFormData({
      courseName: scorecard.courseName,
      date: scorecard.date,
      totalPar: scorecard.totalPar,
      holes: scorecard.holes
    });
    setEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      courseName: '',
      date: '',
      totalPar: 72,
      holes: Array(18).fill(null).map((_, index) => ({
        number: index + 1,
        par: index < 4 || (index >= 9 && index < 13) ? 4 : (index === 4 || index === 13 ? 5 : 3),
        score: 0,
        putts: 0
      }))
    });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get score color based on performance
  const getScoreColor = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return '#10b981'; // Eagle or better - green
    if (diff === -1) return '#3b82f6'; // Birdie - blue
    if (diff === 0) return '#6b7280'; // Par - gray
    if (diff === 1) return '#f59e0b'; // Bogey - orange
    return '#ef4444'; // Double bogey or worse - red
  };

  // Get score label
  const getScoreLabel = (score, par) => {
    const diff = score - par;
    if (diff <= -3) return 'Albatross';
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    return `+${diff}`;
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Alert severity="info">
          Please sign in to track your scores.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 10, sm: 12 }, 
        mb: 4,
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Score Tracking
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                mt: 0.5 
              }}
            >
              Track your rounds, analyze your game, and improve your score
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            fullWidth={false}
            sx={{
              background: theme.gradients.primary,
              whiteSpace: 'nowrap',
              minWidth: { xs: '100%', sm: 'auto' },
              '&:hover': {
                background: theme.gradients.secondary
              }
            }}
          >
            New Scorecard
          </Button>
        </Box>
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
      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows.card }}>
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
            icon={<ScoreIcon />} 
            label="Recent Rounds" 
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingUp />} 
            label="Statistics" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        // Recent Rounds Tab
        <>
          {scorecards.length === 0 ? (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 2,
                boxShadow: theme.shadows.card 
              }}
            >
              <ScoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No scorecards yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start tracking your rounds to see your progress!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  background: theme.gradients.primary,
                  '&:hover': { background: theme.gradients.secondary }
                }}
              >
                Create First Scorecard
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {scorecards.map((scorecard) => (
                <Grid item xs={12} key={scorecard.id}>
                  <HoverCard>
                    <Card sx={{ 
                      borderRadius: 2,
                      boxShadow: theme.shadows.card
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        {/* Header */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          mb: 2,
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                              }}
                            >
                              {scorecard.courseName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(scorecard.date)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(scorecard)}
                              sx={{ 
                                p: { xs: 0.5, sm: 1 }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteScorecard(scorecard.id)}
                              sx={{ 
                                p: { xs: 0.5, sm: 1 }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Score Summary */}
                        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: { xs: 1.5, sm: 2 }, 
                              textAlign: 'center', 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              borderRadius: 2
                            }}>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                              >
                                {scorecard.totalScore}
                              </Typography>
                              <Typography 
                                variant="caption"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              >
                                Total Score
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: { xs: 1.5, sm: 2 }, 
                              textAlign: 'center', 
                              bgcolor: getScoreColor(scorecard.totalScore, scorecard.totalPar), 
                              color: 'white',
                              borderRadius: 2
                            }}>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                              >
                                {scorecard.relativeToPar}
                              </Typography>
                              <Typography 
                                variant="caption"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              >
                                vs Par {scorecard.totalPar}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: { xs: 1.5, sm: 2 }, 
                              textAlign: 'center', 
                              bgcolor: 'secondary.main', 
                              color: 'white',
                              borderRadius: 2
                            }}>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 700,
                                  fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                              >
                                {scorecard.totalPutts}
                              </Typography>
                              <Typography 
                                variant="caption"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                              >
                                Total Putts
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* Hole-by-Hole Scores */}
                        <TableContainer sx={{ 
                          overflowX: 'auto',
                          mb: 2,
                          '&::-webkit-scrollbar': {
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.3)',
                            }
                          }
                        }}>
                          <Table size="small" sx={{ minWidth: { xs: '600px', sm: '100%' } }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Hole
                                </TableCell>
                                {scorecard.holes.slice(0, 9).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center" 
                                    sx={{ 
                                      fontWeight: 600,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.number}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  OUT
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Par
                                </TableCell>
                                {scorecard.holes.slice(0, 9).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center"
                                    sx={{
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.par}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.holes.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Score
                                </TableCell>
                                {scorecard.holes.slice(0, 9).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center"
                                    sx={{ 
                                      fontWeight: 600,
                                      color: getScoreColor(hole.score, hole.par),
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.score}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.holes.slice(0, 9).reduce((sum, h) => sum + h.score, 0)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <TableContainer sx={{ 
                          mt: 2,
                          overflowX: 'auto',
                          '&::-webkit-scrollbar': {
                            height: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.3)',
                            }
                          }
                        }}>
                          <Table size="small" sx={{ minWidth: { xs: '650px', sm: '100%' } }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Hole
                                </TableCell>
                                {scorecard.holes.slice(9, 18).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center" 
                                    sx={{ 
                                      fontWeight: 600,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.number}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  IN
                                </TableCell>
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  TOTAL
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Par
                                </TableCell>
                                {scorecard.holes.slice(9, 18).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center"
                                    sx={{
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.par}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.holes.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                                </TableCell>
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.totalPar}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  p: { xs: 1, sm: 2 }
                                }}>
                                  Score
                                </TableCell>
                                {scorecard.holes.slice(9, 18).map(hole => (
                                  <TableCell 
                                    key={hole.number} 
                                    align="center"
                                    sx={{ 
                                      fontWeight: 600,
                                      color: getScoreColor(hole.score, hole.par),
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      p: { xs: 0.5, sm: 2 }
                                    }}
                                  >
                                    {hole.score}
                                  </TableCell>
                                ))}
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'grey.100',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.holes.slice(9, 18).reduce((sum, h) => sum + h.score, 0)}
                                </TableCell>
                                <TableCell 
                                  align="center" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    p: { xs: 0.5, sm: 2 }
                                  }}
                                >
                                  {scorecard.totalScore}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        // Statistics Tab
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {stats && (
            <>
              {/* Summary Stats */}
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  textAlign: 'center', 
                  borderRadius: 2, 
                  boxShadow: theme.shadows.card 
                }}>
                  <ScoreIcon sx={{ 
                    fontSize: { xs: 32, sm: 40 }, 
                    color: 'primary.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats.totalRounds || 0}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  >
                    Rounds Played
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  textAlign: 'center', 
                  borderRadius: 2, 
                  boxShadow: theme.shadows.card 
                }}>
                  <TrendingUp sx={{ 
                    fontSize: { xs: 32, sm: 40 }, 
                    color: 'success.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats.averageScore || 'N/A'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  >
                    Average Score
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  textAlign: 'center', 
                  borderRadius: 2, 
                  boxShadow: theme.shadows.card 
                }}>
                  <EmojiEvents sx={{ 
                    fontSize: { xs: 32, sm: 40 }, 
                    color: 'warning.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats.bestScore || 'N/A'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  >
                    Best Score
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  textAlign: 'center', 
                  borderRadius: 2, 
                  boxShadow: theme.shadows.card 
                }}>
                  <Flag sx={{ 
                    fontSize: { xs: 32, sm: 40 }, 
                    color: 'secondary.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stats.averagePutts || 'N/A'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  >
                    Avg Putts/Round
                  </Typography>
                </Paper>
              </Grid>

              {/* Score Distribution */}
              {stats.scoreDistribution && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    borderRadius: 2, 
                    boxShadow: theme.shadows.card 
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: { xs: 2, sm: 3 },
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      Score Distribution
                    </Typography>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                      {Object.entries(stats.scoreDistribution).map(([label, count]) => (
                        <Grid item xs={6} sm={4} md={2} key={label}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: 'grey.50',
                            borderRadius: 2
                          }}>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 700, 
                                color: 'primary.main',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                              }}
                            >
                              {count}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
      )}

      {/* Create/Edit Scorecard Dialog */}
      <Dialog 
        open={createDialogOpen || editDialogOpen} 
        onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScoreIcon sx={{ mr: 1, color: 'primary.main' }} />
            {createDialogOpen ? 'New Scorecard' : 'Edit Scorecard'}
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
              label="Total Par"
              name="totalPar"
              type="number"
              value={formData.totalPar}
              onChange={handleInputChange}
              fullWidth
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Hole-by-Hole Scores
            </Typography>

            <Grid container spacing={2}>
              {formData.holes.map((hole, index) => (
                <Grid item xs={6} sm={4} md={3} key={hole.number}>
                  <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Hole {hole.number} (Par {hole.par})
                    </Typography>
                    <TextField
                      label="Score"
                      type="number"
                      value={hole.score || ''}
                      onChange={(e) => handleHoleChange(index, 'score', e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Putts"
                      type="number"
                      value={hole.putts || ''}
                      onChange={(e) => handleHoleChange(index, 'putts', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Total Score:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateTotalScore(formData.holes)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">vs Par:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateRelativeToPar(calculateTotalScore(formData.holes), formData.totalPar)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Total Putts:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateTotalPutts(formData.holes)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setCreateDialogOpen(false); setEditDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button 
            onClick={createDialogOpen ? handleCreateScorecard : handleUpdateScorecard}
            variant="contained"
            sx={{
              background: theme.gradients.primary,
              '&:hover': { background: theme.gradients.secondary }
            }}
          >
            {createDialogOpen ? 'Save Scorecard' : 'Update Scorecard'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
