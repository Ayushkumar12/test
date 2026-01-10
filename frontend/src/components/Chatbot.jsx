import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TypingEffect from './ui/TypingEffect';
import FormattedMessage from './ui/FormattedMessage';
import { useAchievement } from '../context/AchievementContext';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Fab,
  Avatar,
  CircularProgress,
  Tooltip,
  Zoom,
  Fade,
  Stack,
  InputAdornment,
  Button,
  Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Minimize as MinimizeIcon,
  Fullscreen as MaximizeIcon,
  AutoAwesome as SparklesIcon,
  MenuBook as BookOpenIcon,
  AssignmentTurnedIn as ClipboardCheckIcon,
  MedicalServices as StethoscopeIcon
} from '@mui/icons-material';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { celebrate } = useAchievement();
  const { updateUser } = useAuth();

  const quickActions = [
    { icon: <BookOpenIcon sx={{ fontSize: 16 }} />, label: 'Study Tips', prompt: 'Give me some nursing study tips.' },
    { icon: <ClipboardCheckIcon sx={{ fontSize: 16 }} />, label: 'Analyze Results', prompt: 'Analyze my performance.' },
    { icon: <StethoscopeIcon sx={{ fontSize: 16 }} />, label: 'Case Study', prompt: 'Give me a medical case.' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized, isOpen]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/ai/history');
      if (response.data && response.data.length > 0) {
        setMessages(response.data);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: "Hello! I'm your Smart Medical Tutor. I've reviewed your profile and I'm ready to help you excel in your nursing exams. What should we focus on today?"
          }
        ]);
      }
    } catch (error) {
      setMessages([{ role: 'assistant', content: 'Hello! How can I assist with your medical studies today?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text = input) => {
    const messageToSend = typeof text === 'string' ? text : input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: messageToSend });
      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.reply,
        imageUrl: response.data.imageUrl 
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      if (response.data.newAchievements && response.data.newAchievements.length > 0) {
        celebrate(response.data.newAchievements);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Technical error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: { xs: 16, md: 24 },
      right: { xs: 16, md: 24 },
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      maxWidth: 'calc(100vw - 32px)'
    }}>
      <Zoom in={isOpen} unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            width: isMinimized ? { xs: 280, sm: 300 } : { xs: 'calc(100vw - 32px)', sm: 400 },
            height: isMinimized ? 64 : { xs: 'min(600px, calc(100vh - 100px))', sm: 600 },
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            transition: 'all 0.3s ease-in-out',
            bgcolor: 'background.paper'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: isMinimized ? 'primary.main' : 'transparent',
              borderBottom: isMinimized ? 'none' : '1px solid',
              borderColor: 'divider',
              color: isMinimized ? 'white' : 'text.primary',
              transition: 'background-color 0.3s'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  bgcolor: isMinimized ? 'rgba(255,255,255,0.2)' : 'primary.main',
                  width: 40,
                  height: 40
                }}
              >
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Smart AI Tutor
                  {!isMinimized && <SparklesIcon sx={{ fontSize: 14, color: 'warning.main' }} />}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 6, height: 6, bgcolor: isMinimized ? 'white' : 'success.main', borderRadius: '50%' }} />
                  <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, letterSpacing: 0.5 }}>ONLINE</Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => setIsMinimized(!isMinimized)}
                sx={{ color: isMinimized ? 'white' : 'text.secondary' }}
              >
                {isMinimized ? <MaximizeIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: isMinimized ? 'white' : 'text.secondary' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((msg, index) => (
                  <Fade in={true} key={index}>
                    <Box sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: '85%',
                          p: 1.5,
                          borderRadius: '16px',
                          borderBottomRightRadius: msg.role === 'user' ? 0 : '16px',
                          borderBottomLeftRadius: msg.role === 'assistant' ? 0 : '16px',
                          bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                          color: msg.role === 'user' ? 'white' : 'text.primary',
                          fontSize: '0.875rem',
                          lineHeight: 1.5
                        }}
                      >
                        {msg.role === 'assistant' && index === messages.length - 1 ? (
                          <TypingEffect text={msg.content} speed={20} />
                        ) : (
                          <FormattedMessage content={msg.content} />
                        )}
                        {msg.imageUrl && (
                          <Box sx={{ mt: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                            <img src={msg.imageUrl} alt="AI Illustration" style={{ width: '100%', height: 'auto', display: 'block' }} />
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Fade>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Paper sx={{ p: 1.5, borderRadius: '16px', borderBottomLeftRadius: 0, bgcolor: 'grey.100' }}>
                      <CircularProgress size={16} thickness={5} />
                    </Paper>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Footer */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                {messages.length < 4 && (
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    {quickActions.map((action, idx) => (
                      <Chip
                        key={idx}
                        icon={action.icon}
                        label={action.label}
                        onClick={() => handleSend(action.prompt)}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="submit"
                            color="primary"
                            disabled={isLoading || !input.trim()}
                            edge="end"
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px' }
                    }}
                  />
                </form>
              </Box>
            </>
          )}
        </Paper>
      </Zoom>

      {!isOpen && (
        <Zoom in={!isOpen}>
          <Fab
            color="primary"
            aria-label="chat"
            onClick={() => setIsOpen(true)}
            sx={{
              width: 64,
              height: 64,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              '&:hover': { transform: 'scale(1.05)' },
              transition: 'transform 0.2s'
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};

export default Chatbot;
