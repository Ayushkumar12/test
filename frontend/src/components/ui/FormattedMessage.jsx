import React from 'react';
import { Box } from '@mui/material';

const FormattedMessage = ({ content }) => {
  if (!content) return null;

  // Split by ### for spacing
  const sections = content.split('###');

  return (
    <>
      {sections.map((section, sIdx) => {
        // Parse bold text **text**
        // This regex catches **text** and also handles partial typing like **te
        const parts = section.split(/(\*\*.*?\*\*|\*\*.*)/g);
        
        return (
          <React.Fragment key={sIdx}>
            <Box component="div" sx={{ mb: sIdx < sections.length - 1 ? 2 : 0 }}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Box component="span" key={pIdx} sx={{ fontWeight: 'bold' }}>
                      {part.slice(2, -2)}
                    </Box>
                  );
                } else if (part.startsWith('**')) {
                  // Partial bold (during typing)
                  return (
                    <Box component="span" key={pIdx} sx={{ fontWeight: 'bold' }}>
                      {part.slice(2)}
                    </Box>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </Box>
            {sIdx < sections.length - 1 && <Box sx={{ height: '8px' }} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FormattedMessage;
