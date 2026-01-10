const User = require('../models/User');
const Attempt = require('../models/Attempt');

const ACHIEVEMENTS = {
  FIRST_EXAM: {
    title: 'First Step',
    description: 'Completed your first exam!',
    icon: '🎯'
  },
  HIGH_SCORE: {
    title: 'High Achiever',
    description: 'Scored 90% or higher in an exam!',
    icon: '⭐'
  },
  PERFECT_SCORE: {
    title: 'Perfect Score',
    description: 'Scored 100% in an exam!',
    icon: '🏆'
  },
  FIVE_EXAMS: {
    title: 'Persistent Learner',
    description: 'Completed 5 exams!',
    icon: '📚'
  },
  TEN_EXAMS: {
    title: 'Exam Master',
    description: 'Completed 10 exams!',
    icon: '🎓'
  },
  FIRST_LOGIN: {
    title: 'Welcome Aboard',
    description: 'Logged in for the first time!',
    icon: '👋'
  },
  THREE_DAY_STREAK: {
    title: 'Consistent Learner',
    description: 'Maintained a 3-day login streak!',
    icon: '🔥'
  },
  FIVE_DAY_STREAK: {
    title: 'Workhorse',
    description: 'Maintained a 5-day login streak!',
    icon: '🐎'
  },
  SEVEN_DAY_STREAK: {
    title: 'Dedicated Scholar',
    description: 'Maintained a 7-day login streak!',
    icon: '⚡'
  },
  NINE_DAY_STREAK: {
    title: 'Unstoppable Force',
    description: 'Maintained a 9-day login streak!',
    icon: '🚀'
  },
  FIFTEEN_DAY_STREAK: {
    title: 'Elite Scholar',
    description: 'Maintained a 15-day login streak!',
    icon: '👑'
  },
  THIRTY_DAY_STREAK: {
    title: 'Legendary Dedication',
    description: 'Maintained a 30-day login streak!',
    icon: '💎'
  },
  CHAT_BEGINNER: {
    title: 'Curious Mind',
    description: 'Used the AI Tutor for the first time!',
    icon: '🤖'
  },
  CHAT_MASTER: {
    title: 'AI Enthusiast',
    description: 'Asked 10 questions to the AI Tutor!',
    icon: '🧠'
  },
  NIGHT_OWL: {
    title: 'Night Owl',
    description: 'Completed an exam between 12 AM and 5 AM!',
    icon: '🌙'
  },
  EARLY_BIRD: {
    title: 'Early Bird',
    description: 'Completed an exam between 5 AM and 8 AM!',
    icon: '🌅'
  },
  WEEKEND_WARRIOR: {
    title: 'Weekend Warrior',
    description: 'Completed an exam on a Saturday or Sunday!',
    icon: '📅'
  },
  MARATHONER: {
    title: 'Marathoner',
    description: 'Completed 3 or more exams in a single day!',
    icon: '🏃'
  },
  IMPROVING: {
    title: 'On the Rise',
    description: 'Scored better in your current exam than the previous one!',
    icon: '📈'
  },
  DIVERSE_LEARNER: {
    title: 'Diverse Learner',
    description: 'Completed exams in 3 different categories!',
    icon: '🌐'
  },
  CENTURY_CLUB: {
    title: 'Century Club',
    description: 'Scored 100% on a full-length (100 question) exam!',
    icon: '💯'
  },
  // --- Exam Count Milestones (10 more) ---
  TWENTY_EXAMS: { title: 'Dedicated Learner', description: 'Completed 20 exams!', icon: '📚' },
  FIFTY_EXAMS: { title: 'Study Machine', description: 'Completed 50 exams!', icon: '⚙️' },
  HUNDRED_EXAMS: { title: 'Exam Century', description: 'Completed 100 exams!', icon: '🏅' },
  TWO_HUNDRED_EXAMS: { title: 'Medical Scholar', description: 'Completed 200 exams!', icon: '📜' },
  FIVE_HUNDRED_EXAMS: { title: 'Knowledge Titan', description: 'Completed 500 exams!', icon: '🏛️' },
  NHM_FAN: { title: 'NHM Aspirant', description: 'Completed 10 NHM exams!', icon: '🏥' },
  CHO_FAN: { title: 'CHO Specialist', description: 'Completed 10 CHO exams!', icon: '👨‍⚕️' },
  ESIC_FAN: { title: 'ESIC Warrior', description: 'Completed 10 ESIC exams!', icon: '🛡️' },
  AIIMS_FAN: { title: 'AIIMS Elite', description: 'Completed 10 AIIMS exams!', icon: '✨' },
  JIPMER_FAN: { title: 'JIPMER Pro', description: 'Completed 10 JIPMER exams!', icon: '💎' },

  // --- Score Milestones (10 more) ---
  THREE_PERFECT_SCORES: { title: 'Hat-trick', description: 'Achieved 3 perfect scores!', icon: '🎩' },
  TEN_PERFECT_SCORES: { title: 'Perfect Ten', description: 'Achieved 10 perfect scores!', icon: '🌟' },
  TWENTY_HIGH_SCORES: { title: 'Consistent Excellence', description: 'Scored 90% or higher in 20 exams!', icon: '📈' },
  FIFTY_HIGH_SCORES: { title: 'Elite Performer', description: 'Scored 90% or higher in 50 exams!', icon: '🚀' },
  TOTAL_SCORE_1000: { title: 'Point Collector', description: 'Accumulated 1,000 total correct answers!', icon: '💰' },
  TOTAL_SCORE_5000: { title: 'Score Master', description: 'Accumulated 5,000 total correct answers!', icon: '💰' },
  TOTAL_SCORE_10000: { title: 'Question Crusher', description: 'Accumulated 10,000 total correct answers!', icon: '💥' },
  SMART_START: { title: 'Brilliant Beginning', description: 'Scored 100% on your very first exam!', icon: '💡' },
  COMEBACK_KID: { title: 'Comeback Kid', description: 'Scored 90% after a previous score below 50%!', icon: '🔄' },
  GOLDEN_MEAN: { title: 'Solid Foundation', description: 'Maintained an average score of 75% over 10 exams!', icon: '🧱' },

  // --- Login & Streak Milestones (10 more) ---
  SIXTY_DAY_STREAK: { title: 'Two-Month Commitment', description: 'Maintained a 60-day login streak!', icon: '📅' },
  HUNDRED_DAY_STREAK: { title: 'Century Streak', description: 'Maintained a 100-day login streak!', icon: '💯' },
  YEAR_STREAK: { title: 'Ultimate Dedicated', description: 'Maintained a 365-day login streak!', icon: '🌍' },
  WEEKEND_WARRIOR_PLUS: { title: 'Weekend Devotion', description: 'Completed exams on 4 consecutive weekends!', icon: '🗓️' },
  NIGHT_OWL_PRO: { title: 'Midnight Scholar', description: 'Completed 5 exams during midnight hours!', icon: '🧛' },
  EARLY_BIRD_PRO: { title: 'Sunrise Success', description: 'Completed 5 exams during early morning hours!', icon: '🌅' },
  LUNCH_BREAK_LEARNER: { title: 'Productive Lunch', description: 'Completed an exam between 12 PM and 2 PM!', icon: '🍱' },
  AFTER_SCHOOL_STUDY: { title: 'Evening Diligence', description: 'Completed an exam between 4 PM and 7 PM!', icon: '🌆' },
  HOLIDAY_HERO: { title: 'Holiday Hero', description: 'Completed an exam on New Year or Christmas!', icon: '🎄' },
  STREAK_SAVER: { title: 'Consistency King', description: 'Maintained a streak for 14 days without missing!', icon: '🛡️' },

  // --- AI Tutor & Interaction (10 more) ---
  AI_FRIEND: { title: 'AI Explorer', description: 'Asked 25 questions to the AI Tutor!', icon: '🤖' },
  AI_PARTNER: { title: 'AI Collaborator', description: 'Asked 50 questions to the AI Tutor!', icon: '🤝' },
  AI_ADDICT: { title: 'AI Power User', description: 'Asked 100 questions to the AI Tutor!', icon: '⚡' },
  KNOWLEDGE_SEEKER: { title: 'Knowledge Seeker', description: 'Used AI Tutor after failing a question!', icon: '🔍' },
  DEEP_DIVE: { title: 'Deep Dive', description: 'Asked AI 5 questions in a single session!', icon: '🤿' },
  QUICK_QUERY: { title: 'Quick Learner', description: 'Asked AI a question immediately after an exam!', icon: '⏱️' },
  TOPIC_MASTERY_AI: { title: 'Topic Mastery', description: 'Asked about 5 different topics in AI Tutor!', icon: '🧠' },
  AI_GUIDED: { title: 'AI Guided', description: 'Completed 5 exams after consulting the AI Tutor!', icon: '🗺️' },
  BOT_BESTIE: { title: 'Bot Bestie', description: 'Used AI Tutor for 7 consecutive days!', icon: '🤖' },
  WISDOM_WEAVER: { title: 'Wisdom Weaver', description: 'Asked a very long question to the AI Tutor!', icon: '🕸️' },

  // --- Variety & Special (10 more) ---
  JACK_OF_ALL_TRADES: { title: 'Jack of All Trades', description: 'Completed at least one exam from every category!', icon: '🃏' },
  SPECIALIST: { title: 'Specialist', description: 'Completed 50 exams in a single category!', icon: '🎯' },
  DIVERSE_PORTFOLIO: { title: 'Diverse Portfolio', description: 'Completed 5 different types of exams!', icon: '📂' },
  REPEAT_CUSTOMER: { title: 'Perfectionist', description: 'Retook the same exam type 5 times!', icon: '🔁' },
  EXAM_SPRINTER: { title: 'Exam Sprinter', description: 'Completed 2 exams within 30 minutes!', icon: '🏃‍♂️' },
  LONG_HAUL: { title: 'Long Haul', description: 'Completed 10 exams in a single week!', icon: '🚛' },
  STEADY_PROGRESS: { title: 'Steady Progress', description: 'Increased score in 3 consecutive exams!', icon: '📈' },
  NO_STONE_UNTURNED: { title: 'No Stone Unturned', description: 'Attempted every available exam type!', icon: '💎' },
  // --- Clinical Simulation Achievements ---
  SIM_NOVICE: { title: 'Sim Novice', description: 'Completed your first clinical simulation!', icon: '🩺' },
  SIM_EXPERT: { title: 'Sim Expert', description: 'Successfully resolved 5 clinical simulations!', icon: '🚑' },
  SIM_MASTER: { title: 'Sim Master', description: 'Successfully resolved 15 clinical simulations!', icon: '🏥' },
  LIFESAVER: { title: 'Lifesaver', description: 'Resolved a clinical simulation with the patient in critical status!', icon: '❤️' },
  // --- Funny/Worsened Case Achievements ---
  OOPSIE_DAISY: { title: 'Oopsie Daisy', description: 'The patient\'s condition worsened significantly under your care.', icon: '🫣' },
  PANIC_MODE: { title: 'Panic Mode', description: 'Made decisions that led to a deteriorating patient status.', icon: '😨' },
  WALKING_LIABILITY: { title: 'Walking Liability', description: 'Finished a simulation with the patient in a worse state than they started.', icon: '🚔' },
  // --- Good/Improved Case Achievements ---
  NIGHTINGALES_TOUCH: { title: 'Nightingale\'s Touch', description: 'Patient condition improved in every single step of the simulation!', icon: '✨' },
  CALM_UNDER_PRESSURE: { title: 'Calm Under Pressure', description: 'Stabilized a critical patient with expert precision.', icon: '🧘' },
  CLINICAL_INSTINCT: { title: 'Clinical Instinct', description: 'Perfectly resolved a complex clinical case.', icon: '🧠' },
  // --- New Variety Simulation Achievements ---
  DOUBLE_SHIFT: { title: 'Double Shift', description: 'Completed 5 clinical simulations in a single day.', icon: '☕' },
  ZOMBIE_DOC: { title: 'Zombie Doc', description: 'Failed 5 clinical simulations in total. Maybe take a break?', icon: '🧟' },
  CODE_BLUE_VETERAN: { title: 'Code Blue Veteran', description: 'Successfully resolved 10 cases that were in Critical status.', icon: '🚨' },
  PHARMA_PRO: { title: 'Pharmacology Pro', description: 'Correctly administered medication in a clinical simulation.', icon: '💊' },
  VITALS_VIRTUOSO: { title: 'Vitals Virtuoso', description: 'Finished a simulation with all patient vitals in perfect normal range.', icon: '📈' },
  KNOWLEDGE_HUB: { title: 'Knowledge Hub', description: 'Earned 30 different achievements!', icon: '🏢' },
  LEGENDARY_STATUS: { title: 'Legendary Status', description: 'Earned 50 different achievements!', icon: '👑' }
};

const checkAndAwardAchievements = async (userId, metadata = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const attempts = await Attempt.find({ user: userId }).sort({ date: 1 });
    const newlyEarned = [];

    const hasAchievement = (title) => user.achievements.some(a => a.title === title);

    const award = (achievement) => {
      if (!hasAchievement(achievement.title)) {
        user.achievements.push({
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          earnedAt: new Date()
        });
        newlyEarned.push(achievement);
      }
    };

    // 1. First Exam
    if (attempts.length >= 1) {
      award(ACHIEVEMENTS.FIRST_EXAM);
    }

    // 2. High Score (>= 90%)
    const hasHighScore = attempts.some(a => (a.score / a.totalQuestions) >= 0.9);
    if (hasHighScore) {
      award(ACHIEVEMENTS.HIGH_SCORE);
    }

    // 3. Perfect Score (100%)
    const hasPerfectScore = attempts.some(a => (a.score / a.totalQuestions) === 1);
    if (hasPerfectScore) {
      award(ACHIEVEMENTS.PERFECT_SCORE);
    }

    // 4. Five Exams
    if (attempts.length >= 5) {
      award(ACHIEVEMENTS.FIVE_EXAMS);
    }

    // 5. Ten Exams
    if (attempts.length >= 10) {
      award(ACHIEVEMENTS.TEN_EXAMS);
    }

    // 6. Login Streaks
    if (user.lastLogin) {
      award(ACHIEVEMENTS.FIRST_LOGIN);
    }
    if (user.loginStreak >= 3) {
      award(ACHIEVEMENTS.THREE_DAY_STREAK);
    }
    if (user.loginStreak >= 5) {
      award(ACHIEVEMENTS.FIVE_DAY_STREAK);
    }
    if (user.loginStreak >= 7) {
      award(ACHIEVEMENTS.SEVEN_DAY_STREAK);
    }
    if (user.loginStreak >= 9) {
      award(ACHIEVEMENTS.NINE_DAY_STREAK);
    }
    if (user.loginStreak >= 15) {
      award(ACHIEVEMENTS.FIFTEEN_DAY_STREAK);
    }
    if (user.loginStreak >= 30) {
      award(ACHIEVEMENTS.THIRTY_DAY_STREAK);
    }

    // 7. Chatbot Usage
    if (user.chatbotUsageCount >= 1) {
      award(ACHIEVEMENTS.CHAT_BEGINNER);
    }
    if (user.chatbotUsageCount >= 10) {
      award(ACHIEVEMENTS.CHAT_MASTER);
    }

    // 9. Clinical Simulation Achievements
    if (user.storyGamesCompleted >= 1) {
      award(ACHIEVEMENTS.SIM_NOVICE);
    }
    if (user.successfulSimulations >= 5) {
      award(ACHIEVEMENTS.SIM_EXPERT);
    }
    if (user.successfulSimulations >= 15) {
      award(ACHIEVEMENTS.SIM_MASTER);
    }
    
    // Lifesaver: Resolved while patient was in critical status
    if (metadata.gameSuccess && metadata.finalStatus === 'Critical') {
      award(ACHIEVEMENTS.LIFESAVER);
    }

    // New Variety Logic
    if (user.failedSimulations >= 5) {
      award(ACHIEVEMENTS.ZOMBIE_DOC);
    }
    if (user.criticalSimsResolved >= 10) {
      award(ACHIEVEMENTS.CODE_BLUE_VETERAN);
    }
    
    // Pharma Pro: Check for medication keywords in lastAction
    const pharmaKeywords = ['medication', 'administer', 'dose', 'drug', 'injection', 'pill', 'iv', 'infusion', 'mg', 'mcg', 'bolus'];
    if (metadata.lastAction && pharmaKeywords.some(k => metadata.lastAction.toLowerCase().includes(k))) {
      award(ACHIEVEMENTS.PHARMA_PRO);
    }

    // Vitals Virtuoso: Basic normal ranges check
    if (metadata.gameSuccess && metadata.vitals) {
        const { bp, hr, rr, spo2 } = metadata.vitals;
        // Simple heuristic for "normal"
        const hrNum = parseInt(hr);
        const rrNum = parseInt(rr);
        const spo2Num = parseInt(spo2);
        if (hrNum >= 60 && hrNum <= 100 && rrNum >= 12 && rrNum <= 20 && spo2Num >= 95) {
            award(ACHIEVEMENTS.VITALS_VIRTUOSO);
        }
    }

    // Double Shift: 5 sims in 24h
    // We can use activities or just assume based on current session if we had history
    // For now, let's check recent activity count for GAME_COMPLETED
    const Activity = require('../models/Activity');
    const todayStart = new Date().setHours(0,0,0,0);
    const simsToday = await Activity.countDocuments({ 
        user: userId, 
        action: 'GAME_COMPLETED',
        date: { $gte: todayStart }
    });
    if (simsToday >= 5) {
        award(ACHIEVEMENTS.DOUBLE_SHIFT);
    }

    // New Funny/Worsened Logic
    if (metadata.conditionChange === 'Worsened' || metadata.finalStatus === 'Deteriorating') {
      award(ACHIEVEMENTS.PANIC_MODE);
    }
    if (!metadata.gameSuccess && metadata.gameOver) {
      award(ACHIEVEMENTS.OOPSIE_DAISY);
      if (metadata.finalStatus === 'Critical' || metadata.finalStatus === 'Deteriorating') {
        award(ACHIEVEMENTS.WALKING_LIABILITY);
      }
    }

    // New Good/Improved Logic
    if (metadata.gameSuccess && metadata.conditionChange === 'Improved') {
        // If they succeeded and the last step was an improvement
        award(ACHIEVEMENTS.CLINICAL_INSTINCT);
    }
    if (metadata.gameSuccess && metadata.finalStatus === 'Stable' && metadata.initialStatus !== 'Stable') {
        award(ACHIEVEMENTS.CALM_UNDER_PRESSURE);
    }
    // Nightingale's Touch is hard to track without full history in metadata, 
    // but we can approximate it or just award it on high-success streaks
    if (metadata.gameSuccess && metadata.allStepsImproved) {
        award(ACHIEVEMENTS.NIGHTINGALES_TOUCH);
    }
    
    // 8. Performance and Time-based
    if (attempts.length > 0) {
      const latestAttempt = attempts[attempts.length - 1];
      const hour = new Date(latestAttempt.date).getHours();
      const day = new Date(latestAttempt.date).getDay();

      // Night Owl (00:00 - 05:00)
      if (hour >= 0 && hour < 5) {
        award(ACHIEVEMENTS.NIGHT_OWL);
      }

      // Early Bird (05:00 - 08:00)
      if (hour >= 5 && hour < 8) {
        award(ACHIEVEMENTS.EARLY_BIRD);
      }

      // Weekend Warrior (Saturday or Sunday)
      if (day === 0 || day === 6) {
        award(ACHIEVEMENTS.WEEKEND_WARRIOR);
      }

      // Marathoner (3+ exams in a single day)
      const today = new Date(latestAttempt.date).setHours(0,0,0,0);
      const examsToday = attempts.filter(a => new Date(a.date).setHours(0,0,0,0) === today).length;
      if (examsToday >= 3) {
        award(ACHIEVEMENTS.MARATHONER);
      }

      // Improving (Better than previous)
      if (attempts.length >= 2) {
        const prevAttempt = attempts[attempts.length - 2];
        const currentPercent = latestAttempt.score / latestAttempt.totalQuestions;
        const prevPercent = prevAttempt.score / prevAttempt.totalQuestions;
        if (currentPercent > prevPercent) {
          award(ACHIEVEMENTS.IMPROVING);
        }
      }

      // Diverse Learner (3 different exams)
      const uniqueExams = new Set(attempts.map(a => a.exam)).size;
      if (uniqueExams >= 3) {
        award(ACHIEVEMENTS.DIVERSE_LEARNER);
      }

      // Century Club (100% on 100 question exam)
      if (latestAttempt.totalQuestions >= 100 && (latestAttempt.score / latestAttempt.totalQuestions) === 1) {
        award(ACHIEVEMENTS.CENTURY_CLUB);
      }

      // --- NEW LOGIC FOR 50 ACHIEVEMENTS ---

      // Exam Count Milestones
      if (attempts.length >= 20) award(ACHIEVEMENTS.TWENTY_EXAMS);
      if (attempts.length >= 50) award(ACHIEVEMENTS.FIFTY_EXAMS);
      if (attempts.length >= 100) award(ACHIEVEMENTS.HUNDRED_EXAMS);
      if (attempts.length >= 200) award(ACHIEVEMENTS.TWO_HUNDRED_EXAMS);
      if (attempts.length >= 500) award(ACHIEVEMENTS.FIVE_HUNDRED_EXAMS);

      const nhmCount = attempts.filter(a => a.exam === 'NHM').length;
      if (nhmCount >= 10) award(ACHIEVEMENTS.NHM_FAN);
      const choCount = attempts.filter(a => a.exam === 'CHO').length;
      if (choCount >= 10) award(ACHIEVEMENTS.CHO_FAN);
      const esicCount = attempts.filter(a => a.exam === 'ESIC').length;
      if (esicCount >= 10) award(ACHIEVEMENTS.ESIC_FAN);
      const aiimsCount = attempts.filter(a => a.exam === 'AIIMS').length;
      if (aiimsCount >= 10) award(ACHIEVEMENTS.AIIMS_FAN);
      const jipmerCount = attempts.filter(a => a.exam === 'JIPMER').length;
      if (jipmerCount >= 10) award(ACHIEVEMENTS.JIPMER_FAN);

      // Score Milestones
      const perfectScores = attempts.filter(a => (a.score / a.totalQuestions) === 1).length;
      if (perfectScores >= 3) award(ACHIEVEMENTS.THREE_PERFECT_SCORES);
      if (perfectScores >= 10) award(ACHIEVEMENTS.TEN_PERFECT_SCORES);

      const highScores = attempts.filter(a => (a.score / a.totalQuestions) >= 0.9).length;
      if (highScores >= 20) award(ACHIEVEMENTS.TWENTY_HIGH_SCORES);
      if (highScores >= 50) award(ACHIEVEMENTS.FIFTY_HIGH_SCORES);

      const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
      if (totalCorrect >= 1000) award(ACHIEVEMENTS.TOTAL_SCORE_1000);
      if (totalCorrect >= 5000) award(ACHIEVEMENTS.TOTAL_SCORE_5000);
      if (totalCorrect >= 10000) award(ACHIEVEMENTS.TOTAL_SCORE_10000);

      if (attempts.length === 1 && (attempts[0].score / attempts[0].totalQuestions) === 1) {
        award(ACHIEVEMENTS.SMART_START);
      }

      if (attempts.length >= 2) {
        const last = attempts[attempts.length - 1];
        const prev = attempts[attempts.length - 2];
        if ((last.score / last.totalQuestions) >= 0.9 && (prev.score / prev.totalQuestions) < 0.5) {
          award(ACHIEVEMENTS.COMEBACK_KID);
        }
      }

      if (attempts.length >= 10) {
        const last10 = attempts.slice(-10);
        const avg = last10.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0) / 10;
        if (avg >= 0.75) award(ACHIEVEMENTS.GOLDEN_MEAN);
      }

      // Login & Streaks
      if (user.loginStreak >= 60) award(ACHIEVEMENTS.SIXTY_DAY_STREAK);
      if (user.loginStreak >= 100) award(ACHIEVEMENTS.HUNDRED_DAY_STREAK);
      if (user.loginStreak >= 365) award(ACHIEVEMENTS.YEAR_STREAK);
      if (user.loginStreak >= 14) award(ACHIEVEMENTS.STREAK_SAVER);

      const midnightExams = attempts.filter(a => {
        const h = new Date(a.date).getHours();
        return h >= 0 && h < 5;
      }).length;
      if (midnightExams >= 5) award(ACHIEVEMENTS.NIGHT_OWL_PRO);

      const earlyExams = attempts.filter(a => {
        const h = new Date(a.date).getHours();
        return h >= 5 && h < 8;
      }).length;
      if (earlyExams >= 5) award(ACHIEVEMENTS.EARLY_BIRD_PRO);

      if (hour >= 12 && hour < 14) award(ACHIEVEMENTS.LUNCH_BREAK_LEARNER);
      if (hour >= 16 && hour < 19) award(ACHIEVEMENTS.AFTER_SCHOOL_STUDY);

      const isHoliday = (new Date(latestAttempt.date).getMonth() === 11 && new Date(latestAttempt.date).getDate() === 25) || 
                        (new Date(latestAttempt.date).getMonth() === 0 && new Date(latestAttempt.date).getDate() === 1);
      if (isHoliday) award(ACHIEVEMENTS.HOLIDAY_HERO);

      // AI Tutor
      if (user.chatbotUsageCount >= 25) award(ACHIEVEMENTS.AI_FRIEND);
      if (user.chatbotUsageCount >= 50) award(ACHIEVEMENTS.AI_PARTNER);
      if (user.chatbotUsageCount >= 100) award(ACHIEVEMENTS.AI_ADDICT);

      // Variety & Special
      const examTypes = new Set(attempts.map(a => a.exam));
      if (examTypes.size >= 5) award(ACHIEVEMENTS.DIVERSE_PORTFOLIO);
      
      const countsByExam = attempts.reduce((acc, a) => {
        acc[a.exam] = (acc[a.exam] || 0) + 1;
        return acc;
      }, {});
      if (Object.values(countsByExam).some(c => c >= 50)) award(ACHIEVEMENTS.SPECIALIST);
      if (Object.values(countsByExam).some(c => c >= 5)) award(ACHIEVEMENTS.REPEAT_CUSTOMER);

      if (attempts.length >= 2) {
        const diff = new Date(attempts[attempts.length-1].date) - new Date(attempts[attempts.length-2].date);
        if (diff < 30 * 60 * 1000) award(ACHIEVEMENTS.EXAM_SPRINTER);
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const examsThisWeek = attempts.filter(a => new Date(a.date) > oneWeekAgo).length;
      if (examsThisWeek >= 10) award(ACHIEVEMENTS.LONG_HAUL);

      if (attempts.length >= 3) {
        const a1 = attempts[attempts.length-1].score / attempts[attempts.length-1].totalQuestions;
        const a2 = attempts[attempts.length-2].score / attempts[attempts.length-2].totalQuestions;
        const a3 = attempts[attempts.length-3].score / attempts[attempts.length-3].totalQuestions;
        if (a1 > a2 && a2 > a3) award(ACHIEVEMENTS.STEADY_PROGRESS);
      }

      if (user.achievements.length >= 30) award(ACHIEVEMENTS.KNOWLEDGE_HUB);
      if (user.achievements.length >= 50) award(ACHIEVEMENTS.LEGENDARY_STATUS);
    }

    if (newlyEarned.length > 0 || true) { // Check title even if no new achievement this time
      const totalAchievements = user.achievements.length;
      if (totalAchievements >= 60) {
        user.title = 'Sovereign of Medical Knowledge';
      } else if (totalAchievements >= 50) {
        user.title = 'Grandmaster Clinician';
      } else if (totalAchievements >= 40) {
        user.title = 'Eminent Health Scholar';
      } else if (totalAchievements >= 30) {
        user.title = 'Legendary Clinician';
      } else if (totalAchievements >= 25) {
        user.title = 'Master of Medicine';
      } else if (totalAchievements >= 20) {
        user.title = 'Healthcare Hero';
      } else if (totalAchievements >= 15) {
        user.title = 'Clinical Commander';
      } else if (totalAchievements >= 10) {
        user.title = 'Medical Maestro';
      } else if (totalAchievements >= 5) {
        user.title = 'Rising Star';
      } else {
        user.title = 'Medical Aspirant';
      }
      await user.save();
    }

    return newlyEarned;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

module.exports = { checkAndAwardAchievements, ACHIEVEMENTS };
