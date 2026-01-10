import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Container, Box, Typography, Card, CardContent, Grid, Paper, Button, Avatar, Chip, AppBar, Toolbar, IconButton, TextField, FormControl, CircularProgress, Divider, useTheme, useMediaQuery, Stack, Radio, RadioGroup, FormControlLabel, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
} from '@mui/material';
import {
  Delete as DeleteIcon, Logout, Person, Menu, Close, Home as HomeIcon, People as UsersIcon, Description as FileTextIcon, TrendingUp as TrendingUpIcon, Add as PlusCircleIcon, VerifiedUser as ShieldCheckIcon, GpsFixed as TargetIcon, Timeline as ActivityIcon, EmojiEvents as AwardIcon, Download, Visibility,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReportCard from '../components/ReportCard';

const AdminPanel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalAttempts: 0, averageScore: 0 });
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ exam: '', topic: '', question: '', options: ['', '', '', ''], correct: 0, explanation: '' });
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => { fetchAdminData(); }, []);

  const handleLogout = () => {
    logout();
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, questionsRes, attemptsRes, activitiesRes] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/questions'), api.get('/admin/attempts'), api.get('/admin/activities')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setQuestions(questionsRes.data);
      setAttempts(attemptsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to fetch data from the server. The backend service may be starting up (Render free tier) or experiencing issues.');
    } finally {
      setLoading(false);
    }
  };

  const exportData = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/questions', newQuestion);
      alert('Question added successfully!');
      setNewQuestion({ exam: '', topic: '', question: '', options: ['', '', '', ''], correct: 0, explanation: '' });
      fetchAdminData();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question.');
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', newStudent);
      alert('Student added successfully!');
      setShowAddStudent(false);
      setNewStudent({ name: '', email: '', password: '' });
      fetchAdminData();
    } catch (error) {
      console.error('Error adding student:', error);
      alert(error.response?.data?.error || 'Failed to add student.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student and all their data?')) {
      try {
        await api.delete(`/admin/students/${id}`);
        alert('Student deleted successfully!');
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student.');
      }
    }
  };

  const handleViewReport = async (id) => {
    try {
      const response = await api.get(`/admin/students/${id}/report`);
      setSelectedStudentReport(response.data);
      setShowReportDialog(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch student report.');
    }
  };

  const handleDownloadReport = (id) => {
    window.open(`${api.defaults.baseURL}/admin/students/${id}/report/download`, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom sx={{ maxWidth: 600 }}>{error}</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={fetchAdminData}>Retry Connection</Button>
          <Button variant="outlined" onClick={handleLogout}>Logout</Button>
        </Stack>
      </Box>
    );
  }

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: <HomeIcon /> },
    { id: 'users', name: 'Users', icon: <UsersIcon /> },
    { id: 'questions', name: 'Questions', icon: <FileTextIcon /> },
    { id: 'attempts', name: 'Attempts', icon: <TrendingUpIcon /> },
    { id: 'activities', name: 'Activities', icon: <ActivityIcon /> },
    { id: 'add-question', name: 'Add Question', icon: <PlusCircleIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 4 }}>
            <Avatar src="/staff.png" sx={{ bgcolor: 'transparent' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                Medic-grow System
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
              flex: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontWeight: 500,
              },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            {navigationItems.map((item) => (
              <Tab key={item.id} icon={item.icon} label={item.name} value={item.id} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 10 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, pointerEvents: 'auto' }}
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
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  fullWidth
                  startIcon={item.icon}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  {item.name}
                </Button>
              ))}
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

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <UsersIcon />, color: '#1976d2', sub: 'Active learners' },
              { label: 'Total Questions', value: stats.totalQuestions, icon: <TargetIcon />, color: '#2e7d32', sub: 'In database' },
              { label: 'Total Attempts', value: stats.totalAttempts, icon: <ActivityIcon />, color: '#9c27b0', sub: 'Quiz attempts' },
              { label: 'Average Score', value: `${stats.averageScore}%`, icon: <AwardIcon />, color: '#ed6c02', sub: 'Performance' },
            ].map((stat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                  <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', bgcolor: stat.color, opacity: 0.05 }} />
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
                          <Typography variant="h4" fontWeight={800}>{stat.value}</Typography>
                          <Typography variant="caption" sx={{ color: stat.color }} fontWeight={600}>{stat.sub}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: 4, p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={700}>Performance Trends</Typography>
                        <TrendingUpIcon color="primary" />
                      </Stack>
                      <Box sx={{ height: 350, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={Array.isArray(attempts) && attempts.length > 0 ? attempts.slice(-10) : []}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                            <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[3] }} />
                            <Area type="monotone" dataKey="score" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: 4, p: 3, height: '100%' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Activity Distribution</Typography>
                      <Stack spacing={3}>
                        {[
                          { label: 'Active Users', value: users.length, color: 'blue' },
                          { label: 'Questions Added', value: questions.length, color: 'green' },
                          { label: 'Avg. Score', value: `${stats.averageScore}%`, color: 'purple' },
                        ].map((item, i) => (
                          <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: `${item.color}10`, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                              <Typography variant="caption" color="text.secondary">Total count</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid size={12}>
                    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                        <Typography variant="h6" fontWeight={700}>Recent Quiz Attempts</Typography>
                        <Chip label="Live Updates" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </Box>
                  <Box sx={{ height: 400, width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 600, height: '100%' }}>
                      <DataGrid
                        rows={attempts.map(a => ({ ...a, id: a._id }))}
                          columns={[
                            { field: 'userName', headerName: 'Student', flex: 1, renderCell: (params) => (
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, width: 32, height: 32 }}>{params.value?.charAt(0)}</Avatar>
                                  <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
                                </Stack>
                              )},
                            { field: 'date', headerName: 'Date', flex: 0.8, valueFormatter: (value) => new Date(value).toLocaleDateString() },
                            { field: 'score', headerName: 'Score', flex: 0.5, renderCell: (params) => (
                                <Typography variant="body2" fontWeight={700} color={params.value >= 80 ? 'success.main' : params.value >= 50 ? 'warning.main' : 'error.main'}>{params.value}%</Typography>
                              )},
                            { field: 'questionsAnswered', headerName: 'Questions', flex: 0.5 },
                            { field: 'status', headerName: 'Status', flex: 0.7, renderCell: (params) => (
                                <Chip label={params.row.score >= 50 ? 'Passed' : 'Failed'} size="small" color={params.row.score >= 50 ? 'success' : 'error'} sx={{ fontWeight: 600, borderRadius: 1.5 }} />
                              )}
                          ]}
                          pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick sx={{ border: 'none' }}
                        />
                      </Box>
                    </Box>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card sx={{ borderRadius: 4 }}>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <UsersIcon color="primary" /><Typography variant="h6" fontWeight={700}>User Management</Typography>
                      <Chip label={users.length} size="small" color="primary" />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" startIcon={<PlusCircleIcon />} onClick={() => setShowAddStudent(true)} sx={{ borderRadius: 2 }}>Add Student</Button>
                      <Button variant="outlined" startIcon={<Download />} onClick={() => exportData(users, 'users.json')} sx={{ borderRadius: 2 }}>Export Users</Button>
                    </Stack>
                  </Box>
                  <Box sx={{ height: 600, width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 800, height: '100%' }}>
                      <DataGrid
                        rows={users.map(u => ({ ...u, id: u._id }))}
                      columns={[
                        { field: 'name', headerName: 'User', flex: 1, renderCell: (params) => (
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                              <Avatar sx={{ bgcolor: params.row.role === 'admin' ? 'secondary.main' : 'primary.main', width: 32, height: 32 }}>{params.value?.charAt(0)}</Avatar>
                              <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
                            </Stack>
                          )},
                        { field: 'email', headerName: 'Email', flex: 1.2 },
                        { field: 'role', headerName: 'Role', flex: 0.6, renderCell: (params) => (
                            <Chip label={params.value} size="small" color={params.value === 'admin' ? 'secondary' : 'primary'} variant="outlined" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                          )},
                        { field: 'createdAt', headerName: 'Joined', flex: 0.8, valueFormatter: (value) => new Date(value).toLocaleDateString() },
                        { field: 'actions', headerName: 'Actions', flex: 0.8, sortable: false, renderCell: (params) => (
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" color="primary" onClick={() => handleViewReport(params.row._id)} title="View Report">
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="secondary" onClick={() => handleDownloadReport(params.row._id)} title="Download Report">
                              <Download fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteStudent(params.row._id)} title="Delete Student">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) }
                      ]}
                      slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none' }}
                    />
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            )}

            {activeTab === 'questions' && (
              <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card sx={{ borderRadius: 4 }}>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <FileTextIcon color="success" /><Typography variant="h6" fontWeight={700}>Question Bank</Typography>
                      <Chip label={questions.length} size="small" color="success" />
                    </Stack>
                    <Button variant="outlined" color="success" startIcon={<Download />} onClick={() => exportData(questions, 'questions.json')} sx={{ borderRadius: 2 }}>Export Bank</Button>
                  </Box>
                  <Box sx={{ height: 600, width: '100%', overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 800, height: '100%' }}>
                      <DataGrid
                        rows={questions.map(q => ({ ...q, id: q._id }))}
                      columns={[
                        { field: 'question', headerName: 'Question', flex: 2, renderCell: (params) => (
                            <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{params.value}</Typography>
                          )},
                        { field: 'exam', headerName: 'Exam', flex: 0.6, renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" /> },
                        { field: 'topic', headerName: 'Topic', flex: 0.8 },
                        { field: 'actions', headerName: 'Actions', flex: 0.4, sortable: false, renderCell: () => (<IconButton size="small"><FileTextIcon fontSize="small" /></IconButton>) }
                      ]}
                      slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none' }}
                    />
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div key="activities" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card sx={{ borderRadius: 4 }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>Student Activity Log</Typography>
                    <Button startIcon={<Download />} onClick={() => exportData(activities, 'activities.json')}>Export Log</Button>
                  </Box>
                  <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                      rows={activities.map((a, i) => ({ ...a, id: a._id || i }))}
                      columns={[
                        { field: 'date', headerName: 'Timestamp', flex: 1, valueFormatter: (value) => new Date(value).toLocaleString() },
                        { field: 'userName', headerName: 'User', flex: 1, renderCell: (params) => params.row.user?.name || 'System' },
                        { field: 'email', headerName: 'Email', flex: 1, renderCell: (params) => params.row.user?.email || '-' },
                        { field: 'action', headerName: 'Action', flex: 0.8, renderCell: (params) => (
                          <Chip 
                            label={params.value} 
                            size="small" 
                            color={
                              params.value.includes('LOGIN') ? 'info' : 
                              params.value.includes('QUIZ_COMPLETED') ? 'success' : 
                              params.value.includes('QUIZ_STARTED') ? 'warning' : 'default'
                            } 
                            sx={{ fontWeight: 600 }}
                          />
                        )},
                        { field: 'details', headerName: 'Details', flex: 1.5 },
                      ]}
                      pageSizeOptions={[10, 25, 50]}
                      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                      disableRowSelectionOnClick
                      sx={{ border: 'none' }}
                    />
                  </Box>
                </Card>
              </motion.div>
            )}

            {activeTab === 'add-question' && (
              <motion.div key="add" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}><PlusCircleIcon /><Typography variant="h6" fontWeight={700}>Add New Examination Question</Typography></Stack>
                  </Box>
                  <Box component="form" onSubmit={handleSubmitQuestion} sx={{ p: { xs: 3, md: 6 } }}>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Exam Type" placeholder="e.g., NORCET, ESIC" value={newQuestion.exam} onChange={(e) => setNewQuestion({ ...newQuestion, exam: e.target.value })} required variant="outlined" InputProps={{ startAdornment: <TargetIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }} /></Grid>
                      <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Topic / Subject" placeholder="e.g., Anatomy, Pharmacology" value={newQuestion.topic} onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })} required variant="outlined" InputProps={{ startAdornment: <FileTextIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} /> }} /></Grid>
                      <Grid size={12}><TextField fullWidth multiline rows={4} label="Question Statement" value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} required placeholder="Enter complete question..." /></Grid>
                      <Grid size={12}>
                        <Divider sx={{ mb: 2 }}><Chip label="Answer Options" size="small" /></Divider>
                        <FormControl component="fieldset" fullWidth>
                          <RadioGroup value={newQuestion.correct} onChange={(e) => setNewQuestion({ ...newQuestion, correct: parseInt(e.target.value) })}>
                            <Grid container spacing={2}>
                              {newQuestion.options.map((option, index) => (
                                <Grid size={12} key={index}>
                                  <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', borderColor: newQuestion.correct === index ? 'primary.main' : 'divider', bgcolor: newQuestion.correct === index ? 'primary.50' : 'transparent' }}>
                                    <FormControlLabel value={index} control={<Radio />} label="" sx={{ mr: 0 }} />
                                    <TextField fullWidth size="small" variant="standard" placeholder={`Option ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} required InputProps={{ disableUnderline: true }} />
                                    {newQuestion.correct === index && <Chip label="Correct" size="small" color="primary" sx={{ ml: 1, fontWeight: 700 }} />}
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid size={12}><TextField fullWidth multiline rows={3} label="Detailed Explanation" value={newQuestion.explanation} onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })} required placeholder="Explain why selected option is correct..." /></Grid>
                      <Grid size={12}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button variant="text" color="inherit" onClick={() => setNewQuestion({ exam: '', topic: '', question: '', options: ['', '', '', ''], correct: 0, explanation: '' })}>Reset Form</Button>
                          <Button type="submit" variant="contained" size="large" startIcon={<PlusCircleIcon />} sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}>Add to Bank</Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onClose={() => setShowAddStudent(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Student</DialogTitle>
        <Box component="form" onSubmit={handleAddStudent}>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setShowAddStudent(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>Create Student</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Student Report Dialog */}
      <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Student Performance Report
          {selectedStudentReport && (
            <Button 
              startIcon={<Download />} 
              size="small" 
              onClick={() => handleDownloadReport(selectedStudentReport.student._id)}
            >
              Download CSV
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedStudentReport ? (
            <ReportCard data={selectedStudentReport} />
          ) : (
            <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowReportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
