import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  School,
  TrendingUp,
  Assignment,
  EmojiEvents,
} from '@mui/icons-material';

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
  },
};

const ReportCard = ({ data }) => {
  if (!data) return null;

  const { student, attempts, stats } = data;

  return (
    <Box 
      sx={{ p: 1 }}
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 4 }}
        component={motion.div}
        variants={itemVariants}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}>
              {student.name.charAt(0)}
            </Avatar>
          </Grid>
          <Grid size="grow">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {student.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {student.email}
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
                Academic Year 2024-25
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  icon={<School sx={{ color: 'white !important' }} />} 
                  label={student.title || 'Medical Student'} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            variant="outlined" 
            sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}
            component={motion.div}
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <Box sx={{ color: 'primary.main', mb: 1 }}>
              <Assignment fontSize="large" />
            </Box>
            <Typography variant="h4" fontWeight={700}>{stats.totalAttempts}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Quizzes</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            variant="outlined" 
            sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}
            component={motion.div}
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <Box sx={{ color: 'success.main', mb: 1 }}>
              <TrendingUp fontSize="large" />
            </Box>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {stats.averageScore.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Average Score</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            variant="outlined" 
            sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}
            component={motion.div}
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <Box sx={{ color: 'warning.main', mb: 1 }}>
              <EmojiEvents fontSize="large" />
            </Box>
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {stats.highestScore.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Highest Score</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography 
        variant="h6" 
        fontWeight={700} 
        gutterBottom 
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        component={motion.div}
        variants={itemVariants}
      >
        Detailed Performance Log
      </Typography>
      
      <Box
        component={motion.div}
        variants={itemVariants}
      >
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ borderRadius: 3 }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Exam Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Skipped</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Percentage</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.length > 0 ? (
                attempts.map((attempt, index) => {
                  const percentage = (attempt.score / attempt.totalQuestions) * 100;
                  const isPassed = percentage >= 50;
                  const skippedCount = attempt.responses.filter(r => r.selectedOption === null || r.selectedOption === undefined).length;
                  
                  return (
                    <TableRow 
                      key={attempt._id} 
                      hover
                      component={motion.tr}
                      variants={itemVariants}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{attempt.exam}</TableCell>
                      <TableCell color="text.secondary">
                        {new Date(attempt.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell align="center">
                        {attempt.score} / {attempt.totalQuestions}
                      </TableCell>
                      <TableCell align="center">
                        {skippedCount}
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={700} color={isPassed ? 'success.main' : 'error.main'}>
                          {percentage.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={isPassed ? 'PASSED' : 'FAILED'} 
                          size="small"
                          color={isPassed ? 'success' : 'error'}
                          variant="soft"
                          sx={{ fontWeight: 700, borderRadius: 1.5 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No attempts recorded yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box 
        sx={{ mt: 4, textAlign: 'center' }}
        component={motion.div}
        variants={itemVariants}
      >
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          This is an electronically generated report card. All scores are verified by Medic-grow Examination Portal.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportCard;
