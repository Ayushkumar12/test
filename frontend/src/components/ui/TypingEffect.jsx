import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FormattedMessage from './FormattedMessage';

const TypingEffect = ({ text, speed = 30, delay = 0, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeout;
    if (delay > 0) {
      timeout = setTimeout(() => startTyping(), delay);
    } else {
      startTyping();
    }

    function startTyping() {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <motion.span className={className}>
      <FormattedMessage content={displayedText} />
      {!isDone && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ borderRight: '2px solid currentColor', marginLeft: '2px', display: 'inline-block', height: '1em', verticalAlign: 'middle' }}
        />
      )}
    </motion.span>
  );
};

export default TypingEffect;
