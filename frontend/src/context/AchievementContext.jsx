import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

const AchievementContext = createContext();

export const useAchievement = () => useContext(AchievementContext);

export const AchievementProvider = ({ children }) => {
  const [newAchievements, setNewAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const celebrate = (achievements) => {
    if (achievements && achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements]);
      setShowCelebration(true);
      // Auto-hide celebration after 5 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setNewAchievements([]);
      }, 5000);
    }
  };

  return (
    <AchievementContext.Provider value={{ celebrate }}>
      {children}
      {showCelebration && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          style={{ zIndex: 10000 }}
        />
      )}
      <AnimatePresence>
        {showCelebration && newAchievements.map((achievement, index) => (
          <motion.div
            key={`${achievement.title}-${index}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            style={{
              position: 'fixed',
              bottom: 24 + index * 90,
              right: 24,
              zIndex: 10001,
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '2px solid #fbbf24',
              maxWidth: '320px'
            }}
          >
            <div style={{
              fontSize: '32px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {achievement.icon || '🏆'}
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#92400e', fontSize: '16px' }}>New Achievement!</h4>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{achievement.title}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{achievement.description}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </AchievementContext.Provider>
  );
};
