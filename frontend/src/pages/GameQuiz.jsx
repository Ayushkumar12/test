import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ThemeProvider,
  createTheme,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Box,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Avatar,
  Grow,
  Zoom,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Timer,
  Error,
  Psychology,
  TrendingUp,
  PlayArrow,
  Pause,
  Close,
  Star,
  EmojiEvents,
  Bolt,
  Whatshot,
  Grade,
  Celebration,
} from '@mui/icons-material';
import { green, blue, red, orange, yellow, purple } from '@mui/material/colors';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00D4FF', // Neon blue
    },
    secondary: {
      main: '#FF6B6B', // Coral pink
    },
    error: {
      main: '#FF4757', // Bright red
    },
    warning: {
      main: '#FFA726', // Vibrant orange
    },
    success: {
      main: '#00E676', // Bright green
    },
    background: {
      default: '#0F0F23', // Dark blue-gray
      paper: '#1A1A2E', // Slightly lighter dark
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const GameQuiz = () => {
  const { exam } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAI = queryParams.get('ai') !== 'false';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3000); // 50 mins
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [questionPoints, setQuestionPoints] = useState(10);
  const [showConfetti, setShowConfetti] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = isAI ? `/quiz/generate-ai/${exam}` : `/quiz/generate/${exam}`;
        const { data } = await api.get(url);
        
        let rawQuestions = isAI ? data.questions : data;

        if (!rawQuestions || rawQuestions.length === 0) {
          setError("No questions available for this exam yet.");
        } else {
          const processQuestions = (qs) => qs.map(q => {
            const originalOptions = [...q.options];
            const shuffledOptions = [...q.options];
            const mapping = [];

            for (let i = shuffledOptions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }

            shuffledOptions.forEach((option, idx) => {
              const originalIdx = originalOptions.indexOf(option);
              mapping[idx] = originalIdx;
            });

            const newCorrect = mapping.indexOf(q.correct);

            return {
              ...q,
              options: shuffledOptions,
              correct: newCorrect,
              mapping,
              correct_original: q.correct_original !== undefined ? q.correct_original : q.correct
            };
          });

          setQuestions(processQuestions(rawQuestions));

          // If AI, fetch remaining questions in background
          if (isAI && data.allTopics && data.allTopics.length > 2) {
            const remainingTopics = data.allTopics.slice(2);
            api.post('/quiz/generate-ai/remaining', {
              exam,
              topics: remainingTopics,
              startIndex: rawQuestions.length
            }).then(res => {
              if (res.data && res.data.questions) {
                const processedRemaining = processQuestions(res.data.questions);
                setQuestions(prev => [...prev, ...processedRemaining]);
              }
            }).catch(err => console.error("Background loading failed:", err));
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load questions. Please try again.");
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [exam]);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, questions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePoints = (timeBonus, streakBonus) => {
    const basePoints = questionPoints;
    const timeMultiplier = Math.max(0.5, timeLeft / 3000); // Bonus for speed
    const streakMultiplier = 1 + (streak * 0.1); // Bonus for consecutive correct answers
    return Math.round(basePoints * timeMultiplier * streakMultiplier);
  };

  const handleOptionSelect = (optionIndex) => {
    if (responses[currentIndex] !== undefined) return; // Prevent multiple selections

    const isCorrect = optionIndex === questions[currentIndex].correct;
    const earnedPoints = isCorrect ? calculatePoints(true, streak) : 0;

    setResponses({ ...responses, [currentIndex]: optionIndex });
    setShowFeedback(true);
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setPoints(points + earnedPoints);
      setLevel(Math.floor(points / 100) + 1); // Level up every 100 points
      setShowConfetti(true); // Trigger confetti for correct answers
    } else {
      setStreak(0);
    }

    // Auto-advance after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackType(null);
      setShowConfetti(false); // Hide confetti
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setQuestionPoints(10 + (currentIndex + 1) * 2); // Increasing difficulty
      }
    }, 2000);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const formattedResponses = questions.map((q, index) => ({
      questionId: q._id,
      selectedOption: responses[index] !== undefined ? q.mapping[responses[index]] : null,
      correctOption: isAI ? q.correct_original : undefined
    }));

    try {
      const { data } = await api.post('/quiz/submit', { exam, responses: formattedResponses, isAI });
      if (data.user) {
        updateUser(data.user);
      }
      navigate('/result', { 
        state: { 
          attempt: data.attempt, 
          questions, 
          gameMode: true, 
          gameStats: { score, points, level, streak },
          newAchievements: data.newAchievements
        } 
      });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleExitClick = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = () => {
    setExitDialogOpen(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
            p: 3,
          }}
        >
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
              <Typography variant="h4" gutterBottom>
                Preparing Your Game Quiz
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Loading {exam} assessment questions...
              </Typography>
              <CircularProgress size={60} thickness={4} />
            </Box>
          </Fade>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Error Loading Game Quiz
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isTimeLow = timeLeft < 60;

  return (
    <ThemeProvider theme={theme}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)' }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            borderRadius: 0,
            borderBottom: 1,
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ py: { xs: 1, sm: 2 } }}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: { xs: 1, sm: 2 } }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <IconButton
                    onClick={handleExitClick}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      p: { xs: 0.5, sm: 1 },
                      color: 'white',
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Grid>
                <Grid size={{ xs: 6, sm: 9 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Chip
                      icon={<Timer />}
                      label={formatTime(timeLeft)}
                      color={isTimeLow ? 'error' : 'default'}
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.7rem', sm: '1.1rem' },
                        px: { xs: 0.5, sm: 2 },
                        py: 0.5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />

                    <Chip
                      icon={<Star />}
                      label={`Lv.${level}`}
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.7rem', sm: '0.9rem' },
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />

                    <Chip
                      icon={<Bolt />}
                      label={`${points}`}
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.7rem', sm: '0.9rem' },
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />

                    {streak > 0 && (
                      <Chip
                        icon={<Whatshot />}
                        label={`${streak}`}
                        color="warning"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.9rem' },
                          animation: 'pulse 1s infinite',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Question {currentIndex + 1} of {questions.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Paper>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ py: 4 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ mb: 4, position: 'relative', overflow: 'visible' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Paper
                        elevation={3}
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          borderRadius: 2,
                        }}
                      >
                        {currentIndex + 1}
                      </Paper>
                    </motion.div>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Topic: {currentQ.topic}
                      </Typography>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} style={{ color: 'white' }}>
                        {currentQ.question}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Star sx={{ color: yellow[600], fontSize: '1rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          Worth {questionPoints} points
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentQ.options.map((option, idx) => {
                      const isSelected = responses[currentIndex] === idx;
                      const isCorrect = idx === currentQ.correct;
                      const optionLetters = ['A', 'B', 'C', 'D'];

                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={responses[currentIndex] !== undefined}
                            sx={{
                              justifyContent: 'flex-start',
                              p: { xs: 2, sm: 3 },
                              textAlign: 'left',
                              borderRadius: 3,
                              textTransform: 'none',
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              fontWeight: 500,
                              minHeight: 60,
                              position: 'relative',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3,
                              },
                              transition: 'all 0.2s ease-in-out',
                              ...(isSelected && isCorrect && { bgcolor: green[500], color: 'white' }),
                              ...(isSelected && !isCorrect && { bgcolor: red[500], color: 'white' }),
                            }}
                            startIcon={
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: isSelected ? 'white' : 'transparent',
                                  color: isSelected ? 'primary.main' : 'text.secondary',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                  border: isSelected ? 0 : 1,
                                  borderColor: 'divider',
                                }}
                              >
                                {isSelected && isCorrect && <CheckCircle />}
                                {isSelected && !isCorrect && <Error />}
                                {!isSelected && optionLetters[idx]}
                              </Box>
                            }
                          >
                            {option}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Animation */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  elevation={10}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    bgcolor: feedbackType === 'correct' ? green[500] : red[500],
                    color: 'white',
                    minWidth: 300,
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    {feedbackType === 'correct' ? (
                      <Celebration sx={{ fontSize: 60, mb: 2 }} />
                    ) : (
                      <Error sx={{ fontSize: 60, mb: 2 }} />
                    )}
                  </motion.div>
                  <Typography variant="h4" gutterBottom>
                    {feedbackType === 'correct' ? 'Correct!' : 'Incorrect'}
                  </Typography>
                  {feedbackType === 'correct' && (
                    <Typography variant="h6">
                      +{calculatePoints(true, streak)} points!
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              startIcon={<ArrowBack />}
              sx={{ flex: 1, py: 2 }}
            >
              Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                disabled={submitting}
                endIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <CheckCircle />}
                sx={{ flex: 1, py: 2 }}
              >
                {submitting ? 'Finishing...' : 'Finish Game'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                endIcon={<ArrowForward />}
                sx={{ flex: 1, py: 2 }}
              >
                Next
              </Button>
            )}
          </Box>
        </Container>

        {/* Exit Confirmation Dialog */}
        <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
          <DialogTitle>Exit Game Quiz?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to exit? Your progress and points may be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExitConfirm} color="error">
              Exit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default GameQuiz;
