import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { generateSessionPDF } from '../utils/pdfGenerator';
import TypingEffect from '../components/ui/TypingEffect';
import ScrollIn from '../components/ui/ScrollIn';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ReportCard from '../components/ReportCard';
import {
  ThemeProvider,
  createTheme,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  Avatar,
  Grid,
  Paper,
  InputBase,
  Badge,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  Stack,
} from '@mui/material';
import {
  Logout,
  Dashboard as DashboardIcon,
  MenuBook,
  History,
  TrackChanges,
  TrendingUp,
  EmojiEvents,
  AccessTime,
  ChevronRight,
  Person,
  Notifications,
  Search,
  LocalHospital,
  Menu,
  Close,
  Chat,
  PlayArrow,
  Psychology,
  ExpandMore,
  CheckCircle,
  Cancel,
  Info,
  Download,
  Help,
} from '@mui/icons-material';
import { blue, green, amber, purple, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[600],
    },
    secondary: {
      main: green[600],
    },
    warning: {
      main: amber[600],
    },
    background: {
      default: grey[50],
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const hoverVariants = {
  hover: {
    y: -5,
    transition: {
      type: 'spring',
      stiffness: 300,
    },
  },
};


const TITLES = [
  { name: 'Medical Aspirant', min: 0 },
  { name: 'Rising Star', min: 5 },
  { name: 'Medical Maestro', min: 10 },
  { name: 'Clinical Commander', min: 15 },
  { name: 'Healthcare Hero', min: 20 },
  { name: 'Master of Medicine', min: 25 },
  { name: 'Legendary Clinician', min: 30 },
  { name: 'Eminent Health Scholar', min: 40 },
  { name: 'Grandmaster Clinician', min: 50 },
  { name: 'Sovereign of Medical Knowledge', min: 60 },
];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [history, setHistory] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const exams = ["ESIC", "RRB Nursing", "NORCET", "NHM", "CHO", "UPPSC", "KGMU", "SGPGI", "MNS","PGI"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, reportRes] = await Promise.all([
          api.get('/quiz/history'),
          api.get('/quiz/report')
        ]);
        setHistory(historyRes.data);
        setReportData(reportRes.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          logout();
        } else {
          console.error(err);
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = Array.isArray(history) ? history.slice().reverse().map(attempt => ({
    date: new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: Math.round((attempt.score / (attempt.totalQuestions || 1)) * 100)
  })) : [];

  const stats = [
    {
      label: 'Total Quizzes',
      value: Array.isArray(history) ? history.length : 0,
      icon: MenuBook,
      color: blue[600],
    },
    {
      label: 'Avg Score',
      value: (Array.isArray(history) && history.length > 0
        ? (history.reduce((acc, curr) => acc + (curr.score / (curr.totalQuestions || 1)), 0) / history.length * 100).toFixed(1)
        : 0) + '%',
      icon: TrackChanges,
      color: green[600],
    },
    {
      label: 'Latest Score',
      value: (Array.isArray(history) && history.length > 0 ? ((history[0].score / (history[0].totalQuestions || 1)) * 100).toFixed(1) : 0) + '%',
      icon: EmojiEvents,
      color: amber[600],
    },
    {
      label: 'Achievements',
      value: reportData?.student?.achievements?.length || 0,
      icon: EmojiEvents,
      color: purple[600],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const studySessions = (() => {
    if (!Array.isArray(history)) return [];
    
    return history.map(attempt => {
      const questions = attempt.responses
        .filter(resp => resp.questionId && typeof resp.questionId === 'object')
        .map(resp => ({
          ...resp.questionId,
          isCorrect: resp.isCorrect,
          selectedOption: resp.selectedOption
        }));

      return {
        id: attempt._id,
        exam: attempt.exam,
        date: attempt.date,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correct: questions.filter(q => q.isCorrect),
        incorrect: questions.filter(q => !q.isCorrect && q.selectedOption !== null && q.selectedOption !== undefined),
        skipped: questions.filter(q => q.selectedOption === null || q.selectedOption === undefined)
      };
    });
  })();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 4 }}>
              <Avatar src="/staff.png" sx={{ bgcolor: 'transparent' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Medic-grow
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                  Premium Portal
                </Typography>
            </Box>
          </Box>

          <IconButton
            sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Close /> : <Menu />}
          </IconButton>

            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              sx={{
                mr: 'auto',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  fontWeight: 500,
                },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <Tab icon={<DashboardIcon />} label="Dashboard" />
              <Tab icon={<MenuBook />} label="Study Material" />
              <Tab icon={<History />} label="My Performance" />
              <Tab icon={<EmojiEvents />} label="Achievements" />
            </Tabs>

            <Box sx={{ display: { xs: 'none', md: 'block' }, mr: 4 }}>
              <Paper
                component="form"
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  borderRadius: 3,
                  bgcolor: 'grey.50',
                }}
              >
                <IconButton sx={{ p: '10px' }}>
                  <Search />
                </IconButton>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search for subjects, exams..."
                />
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 10 }}>
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {user?.title || 'Student'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ ml: 2, display: { xs: 'none', sm: 'inline-flex' }, pointerEvents: 'auto' }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: 64,
              left: 0,
              right: 0,
              bgcolor: 'white',
              boxShadow: 3,
              zIndex: 1000,
              display: { xs: 'block', md: 'none' },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                startIcon={<DashboardIcon />}
                onClick={() => { setActiveTab(0); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                Dashboard
              </Button>
              <Button
                fullWidth
                startIcon={<MenuBook />}
                onClick={() => { setActiveTab(1); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                Study Material
              </Button>
              <Button
                fullWidth
                startIcon={<History />}
                onClick={() => { setActiveTab(2); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                My Performance
              </Button>
              <Button
                fullWidth
                startIcon={<Chat />}
                onClick={() => { navigate('/chatbot'); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                Chatbot
              </Button>
              <Button
                fullWidth
                startIcon={<EmojiEvents />}
                onClick={() => { setActiveTab(3); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                Achievements
              </Button>
              <Button
                fullWidth
                startIcon={<Logout />}
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                sx={{ justifyContent: 'flex-start', mb: 1, color: 'error.main', pointerEvents: 'auto' }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        )}

          {/* Content */}
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <AnimatePresence mode="wait">
              <Box key={activeTab}>
                {activeTab === 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    variants={containerVariants}
                  >
                    {/* Welcome Section */}
                    <Box 
                      component={motion.div}
                      variants={itemVariants}
                      sx={{ mb: { xs: 4, md: 6 }, textAlign: { xs: 'center', md: 'left' }, px: { xs: 2, md: 0 } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                        <Chip label="Student Dashboard" color="primary" variant="outlined" />
                        {user?.title && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, delay: 0.5 }}
                          >
                            <Chip 
                              label={user.title} 
                              color="secondary" 
                              icon={<EmojiEvents sx={{ color: 'white !important' }} />} 
                              sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                                color: 'white',
                                border: 'none',
                                px: 1
                              }} 
                            />
                          </motion.div>
                        )}
                      </Box>
                      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
                        <TypingEffect text={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`} speed={50} />
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1.1rem', md: '1.25rem' }, maxWidth: { xs: '100%', md: '80%' } }}>
                        You've completed {Array.isArray(history) ? history.length : 0} exams. Your performance is looking great!
                      </Typography>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 6 }}>
                      {stats.map((stat, index) => (
                        <Grid 
                          size={{ xs: 12, sm: 6, md: 4 }} 
                          key={index}
                        >
                          <ScrollIn delay={index * 0.1}>
                            <Card
                              component={motion.div}
                              whileHover={{ y: -5 }}
                              sx={{
                                p: { xs: 2, md: 3 },
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 2, md: 3 },
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                border: '1px solid',
                                borderColor: 'grey.100',
                              }}
                            >
                              <Avatar sx={{ bgcolor: stat.color, width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 } }}>
                                <stat.icon fontSize={isMobile ? "small" : "medium"} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                                  {stat.label}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                                  {stat.value}
                                </Typography>
                              </Box>
                            </Card>
                          </ScrollIn>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Analytics and Quick Actions */}
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                      <Grid size={{ xs: 12, lg: 8 }}>
                        {/* Performance Chart */}
                        <ScrollIn direction="left">
                          <Card 
                            sx={{ 
                              p: { xs: 3, md: 4 }, 
                              mb: 4,
                              borderRadius: 5,
                              boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
                              border: '1px solid',
                              borderColor: 'grey.100',
                              background: 'linear-gradient(to bottom, #ffffff, #fcfcfd)',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
                              <Box>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 800, 
                                  color: 'text.primary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5
                                }}>
                                  <TrendingUp sx={{ color: blue[600] }} />
                                  Performance Analytics
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                                  Your score progression over the last few attempts
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                p: 0.5, 
                                bgcolor: 'grey.100', 
                                borderRadius: 3,
                                width: { xs: '100%', sm: 'auto' }
                              }}>
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  disableElevation
                                  sx={{ 
                                    borderRadius: 2.5,
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    fontWeight: 700,
                                    '&:hover': { bgcolor: 'white' },
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                  }}
                                  fullWidth={isMobile}
                                >
                                  Score
                                </Button>
                                <Button 
                                  variant="text" 
                                  size="small" 
                                  sx={{ 
                                    borderRadius: 2.5,
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    ml: 0.5
                                  }}
                                  fullWidth={isMobile}
                                >
                                  Growth
                                </Button>
                              </Box>
                            </Box>
                            
                            <Box sx={{ height: { xs: 280, sm: 320 }, width: '100%', position: 'relative' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={blue[600]} stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor={blue[600]} stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid 
                                    strokeDasharray="4 4" 
                                    vertical={false} 
                                    stroke="#f1f5f9" 
                                  />
                                  <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={15}
                                  />
                                  <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                  />
                                  <Tooltip
                                    cursor={{ stroke: blue[200], strokeWidth: 2, strokeDasharray: '5 5' }}
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <Paper sx={{ 
                                            p: 2, 
                                            borderRadius: 3, 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            border: '1px solid',
                                            borderColor: 'grey.100',
                                            minWidth: 120
                                          }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                              {label}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: blue[600] }} />
                                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                {payload[0].value}% Score
                                              </Typography>
                                            </Box>
                                          </Paper>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke={blue[600]}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    animationDuration={1500}
                                    dot={{ 
                                      fill: '#fff', 
                                      stroke: blue[600], 
                                      strokeWidth: 3, 
                                      r: 5,
                                      fillOpacity: 1
                                    }}
                                    activeDot={{ 
                                      r: 8, 
                                      strokeWidth: 0, 
                                      fill: blue[600],
                                      boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)'
                                    }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </Box>
                          </Card>
                        </ScrollIn>

                        {/* Clinical Story Game Section */}
                        <ScrollIn direction="up">
                          <Card sx={{ 
                            p: { xs: 3, md: 5 }, 
                            mb: 4, 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 6,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            <Box 
                              component={motion.div}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6 }}
                              sx={{ position: 'relative', zIndex: 1 }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)', 
                                  p: 1, 
                                  borderRadius: 2, 
                                  display: 'flex',
                                  backdropFilter: 'blur(4px)'
                                }}>
                                  <Psychology sx={{ fontSize: 24 }} />
                                </Box>
                                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, opacity: 0.9 }}>
                                  {user?.title || 'Interactive Learning'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
                                {(() => {
                                  const totalAchievements = reportData?.student?.achievements?.length || 0;
                                  const currentTitleIndex = TITLES.findIndex((t, i) => {
                                      const nextMin = TITLES[i+1]?.min || Infinity;
                                      return totalAchievements >= t.min && totalAchievements < nextMin;
                                  });
                                  const currentTitle = TITLES[currentTitleIndex] || TITLES[0];
                                  const nextTitle = TITLES[currentTitleIndex + 1];
                                  const progressToNext = nextTitle ? ((totalAchievements - currentTitle.min) / (nextTitle.min - currentTitle.min)) * 100 : 100;

                                  return (
                                    <>
                                      <Chip 
                                        label={`Rank: ${currentTitle.name}`}
                                        size="small"
                                        sx={{ 
                                          bgcolor: 'rgba(255,255,255,0.9)', 
                                          color: '#4f46e5',
                                          fontWeight: 800,
                                          fontSize: '0.75rem',
                                          border: 'none'
                                        }}
                                      />
                                      {nextTitle && (
                                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 100, height: 6, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                                            <Box sx={{ width: `${progressToNext}%`, height: '100%', bgcolor: 'white' }} />
                                          </Box>
                                          <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                                            {totalAchievements}/{nextTitle.min} to {nextTitle.name}
                                          </Typography>
                                        </Box>
                                      )}
                                    </>
                                  );
                                })()}
                              </Box>

                              <Typography variant="h4" gutterBottom sx={{ 
                                fontWeight: 800, 
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                fontSize: { xs: '1.75rem', md: '2.5rem' }
                              }}>
                                Clinical Skill Simulation
                              </Typography>
                              
                              <Typography variant="body1" sx={{ 
                                mb: 3, 
                                opacity: 0.9, 
                                maxWidth: '550px',
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                              }}>
                                Master real-world nursing through immersive scenarios. Make critical decisions, witness consequences, and sharpen your clinical judgment in a risk-free environment.
                              </Typography>

                              {reportData?.student?.achievements?.length > 0 && (
                                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Recent Achievements:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {reportData.student.achievements.slice(-3).reverse().map((achievement, idx) => (
                                      <Tooltip key={idx} title={achievement.title} arrow>
                                        <Box 
                                          component={motion.div}
                                          whileHover={{ y: -5, scale: 1.1 }}
                                          sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            backdropFilter: 'blur(4px)',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          {achievement.icon || '🏆'}
                                        </Box>
                                      </Tooltip>
                                    ))}
                                    {reportData.student.achievements.length > 3 && (
                                      <Box 
                                        onClick={() => setActiveTab(3)}
                                        sx={{ 
                                          width: 40, 
                                          height: 40, 
                                          bgcolor: 'rgba(255,255,255,0.1)', 
                                          borderRadius: '50%', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center',
                                          fontSize: '0.75rem',
                                          fontWeight: 800,
                                          backdropFilter: 'blur(4px)',
                                          border: '1px solid rgba(255,255,255,0.2)',
                                          cursor: 'pointer',
                                          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                        }}
                                      >
                                        +{reportData.student.achievements.length - 3}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              )}

                              <Button 
                                variant="contained" 
                                size="large" 
                                onClick={() => navigate('/story-game')}
                                startIcon={<PlayArrow />}
                                component={motion.button}
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}
                                whileTap={{ scale: 0.98 }}
                                sx={{ 
                                  bgcolor: 'white', 
                                  color: '#4f46e5',
                                  px: 4,
                                  py: 1.5,
                                  borderRadius: 3,
                                  fontSize: '1rem',
                                  fontWeight: 700,
                                  '&:hover': { bgcolor: '#f8fafc' }
                                }}
                              >
                                Launch Simulation
                              </Button>
                            </Box>

                            {/* Decorative Elements */}
                            <Box
                              component={motion.div}
                              animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 20, 
                                repeat: Infinity,
                                ease: "linear" 
                              }}
                              sx={{ 
                                position: 'absolute', 
                                right: -40, 
                                bottom: -40, 
                                fontSize: 280, 
                                opacity: 0.15, 
                                color: 'white',
                                display: 'flex'
                              }}
                            >
                              <Psychology sx={{ fontSize: 'inherit' }} />
                            </Box>

                            <Box sx={{ 
                              position: 'absolute',
                              top: -50,
                              left: '20%',
                              width: 200,
                              height: 200,
                              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                              borderRadius: '50%',
                              pointerEvents: 'none'
                            }} />
                          </Card>
                        </ScrollIn>

                        {/* Quick Actions */}
                        <ScrollIn direction="up">
                          <Card 
                            sx={{ p: { xs: 2, md: 3 } }}
                          >
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                              Quick Actions
                            </Typography>
                            <Grid 
                              container 
                              spacing={2}
                            >
                              {exams.map((exam, index) => (
                                <Grid 
                                  size={{ xs: 12, sm: 6 }} 
                                  key={index}
                                >
                                  <ScrollIn delay={index * 0.05} direction="up">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate(`/quiz/${exam}?ai=true`)}
                                        sx={{
                                          p: { xs: 2, md: 3 },
                                          justifyContent: 'flex-start',
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: 'primary.light', color: 'white' },
                                        }}
                                        startIcon={
                                          <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                                            {exam.charAt(0)}
                                          </Avatar>
                                        }
                                      >
                                        <Box sx={{ textAlign: 'left' }}>
                                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            {exam}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                            Start Practice
                                          </Typography>
                                        </Box>
                                      </Button>
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => navigate(`/game-quiz/${exam}?ai=true`)}
                                        sx={{
                                          p: { xs: 1.5, md: 2.5 },
                                          justifyContent: 'flex-start',
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          bgcolor: 'secondary.main',
                                          '&:hover': { bgcolor: 'secondary.dark' },
                                        }}
                                        startIcon={
                                          <Avatar sx={{ bgcolor: 'secondary.dark', width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 } }}>
                                            <EmojiEvents fontSize="small" />
                                          </Avatar>
                                        }
                                      >
                                        <Box sx={{ textAlign: 'left' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                            Game Mode
                                          </Typography>
                                          <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                                            Fun & Points
                                          </Typography>
                                        </Box>
                                      </Button>
                                    </Box>
                                  </ScrollIn>
                                </Grid>
                              ))}
                            </Grid>
                          </Card>
                        </ScrollIn>
                      </Grid>

                      <Grid size={{ xs: 12, lg: 4 }}>
                        <ScrollIn direction="right">
                          <Card 
                            sx={{ p: { xs: 2, md: 3 }, mb: 4 }}
                          >
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                              Recent Activity
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                              Your recent quiz attempts and study progress.
                            </Typography>
                          </Card>
                        </ScrollIn>

                        <ScrollIn direction="right" delay={0.2}>
                          <Card 
                            sx={{ p: { xs: 2, md: 3 } }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                Achievements
                              </Typography>
                              <Chip 
                                label={`${reportData?.student?.achievements?.length || 0} Earned`} 
                                size="small" 
                                color="secondary" 
                              />
                            </Box>
                            
                            {reportData?.student?.achievements && reportData.student.achievements.length > 0 ? (
                              <Box 
                                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                              >
                                {reportData.student.achievements.slice(0, 5).map((achievement, index) => (
                                  <ScrollIn key={index} delay={index * 0.1} direction="up">
                                    <Box 
                                      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                                    >
                                      <Avatar sx={{ bgcolor: 'amber.50', color: 'amber.700', border: '1px solid', borderColor: 'amber.200' }}>
                                        {achievement.icon || '🏆'}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          {achievement.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {achievement.description}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </ScrollIn>
                                ))}
                                {reportData.student.achievements.length > 5 && (
                                  <Button size="small" variant="text" fullWidth onClick={() => setActiveTab(2)}>
                                    View All Achievements
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <EmojiEvents sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  Complete quizzes to earn achievements!
                                </Typography>
                              </Box>
                            )}
                          </Card>
                        </ScrollIn>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {activeTab === 2 && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ p: 2 }}>
                      <ReportCard data={reportData} />
                    </Card>
                  </motion.div>
                )}

                {activeTab === 1 && (
                  <motion.div
                    key="study"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ py: 4 }}>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Clinical Study Material
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Review your performance session by session to strengthen your clinical knowledge.
                      </Typography>

                      {studySessions.length > 0 ? (
                        studySessions.map((session, sIdx) => (
                          <Card key={session.id} sx={{ mb: 4, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: 'grey.50', 
                              borderBottom: '1px solid', 
                              borderColor: 'grey.200',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 2
                            }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {session.exam} Session
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime sx={{ fontSize: '0.875rem' }} />
                                  {new Date(session.date).toLocaleString(undefined, { 
                                    dateStyle: 'long', 
                                    timeStyle: 'short' 
                                  })}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={`Score: ${session.score}/${session.totalQuestions}`} 
                                  color={session.score / session.totalQuestions >= 0.5 ? 'success' : 'error'}
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                                <Chip 
                                  label={`${Math.round((session.score / session.totalQuestions) * 100)}% Precision`}
                                  variant="outlined"
                                  size="small"
                                />
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Download />}
                                  onClick={() => generateSessionPDF(session)}
                                  sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                >
                                  PDF
                                </Button>
                              </Box>
                            </Box>

                            <Box sx={{ p: 2 }}>
                              {/* Incorrect Questions First as they need most attention */}
                              {session.incorrect.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Cancel fontSize="small" /> Needs Review ({session.incorrect.length})
                                  </Typography>
                                  <Stack spacing={1}>
                                    {session.incorrect.map((q, qIdx) => (
                                      <Accordion key={q._id} sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'error.light', borderRadius: '8px !important' }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {qIdx + 1}. {q.question}
                                          </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <Grid container spacing={1} sx={{ mb: 2 }}>
                                            {q.options.map((opt, i) => (
                                              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                                <Paper sx={{ 
                                                  p: 1.5, 
                                                  border: '1px solid', 
                                                  borderColor: i === q.correct ? 'success.light' : i === q.selectedOption ? 'error.light' : 'grey.100',
                                                  bgcolor: i === q.correct ? 'success.50' : i === q.selectedOption ? 'error.50' : 'white',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1.5
                                                }}>
                                                  <Avatar sx={{ bgcolor: i === q.correct ? 'success.main' : i === q.selectedOption ? 'error.main' : 'grey.200', width: 20, height: 20, fontSize: '0.7rem' }}>
                                                    {String.fromCharCode(65 + i)}
                                                  </Avatar>
                                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{opt}</Typography>
                                                  {i === q.correct && <CheckCircle fontSize="inherit" color="success" sx={{ ml: 'auto' }} />}
                                                </Paper>
                                              </Grid>
                                            ))}
                                          </Grid>
                                          <Alert severity="info" icon={<Info fontSize="small" />} sx={{ py: 0 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>RATIONALE</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{q.explanation}</Typography>
                                          </Alert>
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {/* Skipped Questions */}
                              {session.skipped && session.skipped.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'grey.600', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Help fontSize="small" /> Unattempted Questions ({session.skipped.length})
                                  </Typography>
                                  <Stack spacing={1}>
                                    {session.skipped.map((q, qIdx) => (
                                      <Accordion key={q._id} sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'grey.300', borderRadius: '8px !important' }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {qIdx + 1}. {q.question}
                                          </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <Grid container spacing={1} sx={{ mb: 2 }}>
                                            {q.options.map((opt, i) => (
                                              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                                <Paper sx={{ 
                                                  p: 1.5, 
                                                  border: '1px solid', 
                                                  borderColor: i === q.correct ? 'success.light' : 'grey.100',
                                                  bgcolor: i === q.correct ? 'success.50' : 'white',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1.5
                                                }}>
                                                  <Avatar sx={{ bgcolor: i === q.correct ? 'success.main' : 'grey.200', width: 20, height: 20, fontSize: '0.7rem' }}>
                                                    {String.fromCharCode(65 + i)}
                                                  </Avatar>
                                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{opt}</Typography>
                                                  {i === q.correct && <CheckCircle fontSize="inherit" color="success" sx={{ ml: 'auto' }} />}
                                                </Paper>
                                              </Grid>
                                            ))}
                                          </Grid>
                                          <Alert severity="info" icon={<Info fontSize="small" />} sx={{ py: 0 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>RATIONALE</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{q.explanation}</Typography>
                                          </Alert>
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {/* Correct Questions */}
                              {session.correct.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle fontSize="small" /> Mastered Concepts ({session.correct.length})
                                  </Typography>
                                  <Stack spacing={1}>
                                    {session.correct.map((q, qIdx) => (
                                      <Accordion key={q._id} sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'success.light', borderRadius: '8px !important' }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {qIdx + 1}. {q.question}
                                          </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <Grid container spacing={1} sx={{ mb: 2 }}>
                                            {q.options.map((opt, i) => (
                                              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                                <Paper sx={{ 
                                                  p: 1.5, 
                                                  border: '1px solid', 
                                                  borderColor: i === q.correct ? 'success.light' : 'grey.100',
                                                  bgcolor: i === q.correct ? 'success.50' : 'white',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1.5
                                                }}>
                                                  <Avatar sx={{ bgcolor: i === q.correct ? 'success.main' : 'grey.200', width: 20, height: 20, fontSize: '0.7rem' }}>
                                                    {String.fromCharCode(65 + i)}
                                                  </Avatar>
                                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{opt}</Typography>
                                                  {i === q.correct && <CheckCircle fontSize="inherit" color="success" sx={{ ml: 'auto' }} />}
                                                </Paper>
                                              </Grid>
                                            ))}
                                          </Grid>
                                          <Alert severity="info" icon={<Info fontSize="small" />} sx={{ py: 0 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>RATIONALE</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{q.explanation}</Typography>
                                          </Alert>
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          </Card>
                        ))
                      ) : (
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                          <MenuBook sx={{ fontSize: 100, color: 'grey.200', mb: 2 }} />
                          <Typography variant="h5" color="text.secondary" gutterBottom>
                            No study sessions yet
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Complete some quizzes to see your session-wise performance here.
                          </Typography>
                          <Button 
                            variant="contained" 
                            sx={{ mt: 4 }} 
                            onClick={() => setActiveTab(0)}
                          >
                            Start Your First Quiz
                          </Button>
                        </Paper>
                      )}
                    </Box>
                  </motion.div>
                )}

                {activeTab === 3 && (
                  <motion.div
                    key="achievements"
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 20 }}
                    variants={containerVariants}
                    sx={{ py: 4 }}
                  >
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                      Your Achievements & Certificates
                    </Typography>
                    {reportData?.student?.achievements && reportData.student.achievements.length > 0 ? (
                      <Grid container spacing={3}>
                        {reportData.student.achievements.map((achievement, index) => (
                          <Grid 
                            size={{ xs: 12, sm: 6, md: 4 }} 
                            key={index}
                            component={motion.div}
                            variants={itemVariants}
                            whileHover={{ y: -10 }}
                          >
                            <Card sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              p: 3,
                              textAlign: 'center',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              <Avatar sx={{ 
                                width: 80, 
                                height: 80, 
                                bgcolor: 'amber.50', 
                                color: 'amber.700', 
                                mb: 2,
                                fontSize: '2.5rem',
                                border: '2px solid',
                                borderColor: 'amber.200'
                              }}>
                                {achievement.icon || '🏆'}
                              </Avatar>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {achievement.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {achievement.description}
                              </Typography>
                              <Box sx={{ mt: 'auto' }}>
                                <Chip 
                                  label={`Earned on ${new Date(achievement.earnedAt).toLocaleDateString()}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Paper 
                        sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}
                        component={motion.div}
                        variants={itemVariants}
                      >
                        <EmojiEvents sx={{ fontSize: 100, color: 'grey.200', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                          No achievements yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Keep practicing and completing exams to unlock prestigious badges!
                        </Typography>
                        <Button 
                          variant="contained" 
                          sx={{ mt: 4 }} 
                          onClick={() => setActiveTab(0)}
                        >
                          Start Your First Exam
                        </Button>
                      </Paper>
                    )}
                  </motion.div>
                )}
              </Box>
            </AnimatePresence>
          </Container>
        </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
