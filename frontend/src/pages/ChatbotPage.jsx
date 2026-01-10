import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Chatbot from '../components/Chatbot';

const ChatbotPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Chatbot
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get help with your nursing studies and exam preparation.
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: '70vh' }}>
        <Chatbot />
      </Box>
    </Container>
  );
};

export default ChatbotPage;
