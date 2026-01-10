import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Grow,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  Favorite,
  Timer,
  Assignment,
  HealthAndSafety,
  Mood,
  MoodBad,
} from '@mui/icons-material';

const NursingStoryGame = () => {
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [rotationActive, setRotationActive] = useState(false);
  const navigate = useNavigate();
  const feedbackRef = useRef(null);
  const rotationTimerRef = useRef(null);

  useEffect(() => {
    startGame();
    return () => {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    };
  }, []);

  const startRotationTimer = () => {
    if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    setRotationActive(false);
    rotationTimerRef.current = setTimeout(() => {
      setRotationActive(true);
    }, 8000); // Show rotation message after 8 seconds
  };

  const stopRotationTimer = () => {
    if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    setRotationActive(false);
  };

  const startGame = async () => {
    setLoading(true);
    startRotationTimer();
    try {
      const { data } = await api.post('/game/start');
      setGameState(data);
      setHistory([data]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to start the game. Please try again.');
      setLoading(false);
    } finally {
      stopRotationTimer();
    }
  };

  const handleAction = async (actionText) => {
    if (processing) return;
    setProcessing(true);
    startRotationTimer();
    
    // Create history for AI
    const gameHistory = history.map((h, index) => {
      return {
        scenario: h.scenario,
        actionTaken: index === history.length - 1 ? actionText : h.selectedAction
      };
    });

    try {
      const { data } = await api.post('/game/action', {
        history: gameHistory,
        lastAction: actionText,
      });

      // Update the last history item with the action taken
      const updatedHistory = [...history];
      updatedHistory[updatedHistory.length - 1].selectedAction = actionText;
      
      setGameState(data);
      setHistory([...updatedHistory, data]);
      setProcessing(false);
      // Scroll to feedback if it exists
      if (feedbackRef.current) {
        feedbackRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process action. Please try again.');
      setProcessing(false);
    } finally {
      stopRotationTimer();
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h5" sx={{ mt: 3 }}>
          Preparing Clinical Scenario...
        </Typography>
        {rotationActive && (
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
            Rotating API keys due to high traffic, please wait...
          </Typography>
        )}
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={startGame}>
            RETRY
          </Button>
        }>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const { scenario, options, patientStatus, conditionChange, feedback, gameOver, success, vitalSigns } = gameState;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fa', pb: 8 }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'text.secondary' }}
          >
            Exit
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: { xs: 'none', sm: 'block' } }}>
            Clinical Simulation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {conditionChange && conditionChange !== 'N/A' && (
              <Chip 
                label={conditionChange} 
                size="small"
                color={conditionChange === 'Improved' || conditionChange === 'Stabilized' ? 'success' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
            )}
            <Chip 
              label={patientStatus} 
              size="small"
              color={
                patientStatus === 'Stable' || patientStatus === 'Improving' 
                  ? 'success' 
                  : patientStatus === 'Deteriorating' || patientStatus === 'Critical' 
                  ? 'error' 
                  : 'warning'
              } 
            />
          </Box>
        </Toolbar>
        {/* Progress Bar under Navbar */}
        <LinearProgress 
          variant="determinate" 
          value={((gameState?.step || history.length) / 5) * 100} 
          sx={{ height: 4 }} 
        />
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          
          {/* Vitals Sidebar - Top on Mobile, Left on Desktop */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
              <Paper sx={{ p: 2, borderRadius: 4, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HealthAndSafety fontSize="small" color="primary" /> PATIENT VITALS
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { label: 'BP', value: vitalSigns?.bp || '--/--', icon: '🩸' },
                    { label: 'HR', value: `${vitalSigns?.hr || '--'} bpm`, icon: '💓' },
                    { label: 'RR', value: `${vitalSigns?.rr || '--'} /min`, icon: '🫁' },
                    { label: 'SpO2', value: vitalSigns?.spo2 || '--%', icon: '🌬️' },
                    { label: 'Temp', value: `${vitalSigns?.temp || '--'} °F`, icon: '🌡️' },
                  ].map((v) => (
                    <Grid size={{ xs: 6, sm: 4, md: 12 }} key={v.label}>
                      <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {v.icon} {v.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{v.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          </Grid>

          {/* Main Content Area */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Scenario Card */}
              <Grow in={true}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      STEP {gameState?.step || history.length} OF 5
                    </Typography>
                    {processing && <CircularProgress size={20} />}
                  </Box>
                  
                  {feedback && (
                    <Box sx={{ mb: 4, p: 2.5, borderRadius: 4, bgcolor: feedback.toLowerCase().includes('good') || feedback.toLowerCase().includes('correct') ? 'success.light' : 'info.light', color: 'white' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feedback}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.4, mb: 4 }}>
                    {scenario}
                  </Typography>

                  <Divider sx={{ my: 4 }} />

                  {!gameOver ? (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timer color="primary" /> Clinical Decision
                      </Typography>
                      <Grid container spacing={2}>
                        {options.map((option) => (
                          <Grid size={{ xs: 12 }} key={option.id}>
                            <Button
                              fullWidth
                              variant="outlined"
                              disabled={processing}
                              onClick={() => handleAction(option.text)}
                              sx={{
                                p: 3,
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: 'divider',
                                color: 'text.primary',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderWidth: 2,
                                  borderColor: 'primary.main',
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                  transform: 'translateY(-2px)'
                                },
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500
                              }}
                            >
                              {option.text}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ mb: 3 }}>
                        {success ? (
                          <Mood sx={{ fontSize: 100, color: 'success.main' }} />
                        ) : (
                          <MoodBad sx={{ fontSize: 100, color: 'error.main' }} />
                        )}
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                        {success ? 'Case Resolved Successfully!' : 'Clinical Failure'}
                      </Typography>
                      
                      <Box sx={{ mb: 4, p: 3, bgcolor: success ? 'success.light' : 'error.light', borderRadius: 4, color: 'white' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          FINAL OUTCOME
                        </Typography>
                        <Typography variant="body1">
                          Patient Status: {patientStatus} ({conditionChange || (success ? 'Improved' : 'Worsened')})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button variant="contained" size="large" onClick={startGame} sx={{ borderRadius: 10, px: 4 }}>
                          New Scenario
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} sx={{ borderRadius: 10, px: 4 }}>
                          Dashboard
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grow>

              {processing && rotationActive && (
                <Fade in={true}>
                  <Alert severity="warning" sx={{ borderRadius: 4 }}>
                    Heavy server load detected. Rotating API keys to ensure your game continues...
                  </Alert>
                </Fade>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NursingStoryGame;