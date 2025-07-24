import { useState, useEffect } from 'react';
import { UserLevel, Streak, Achievement, UserStats, LevelReward } from '@/types/gamification';
import { achievementsList } from '@/data/achievements';

const STORAGE_KEYS = {
  USER_LEVEL: 'boltlab_user_level',
  STREAK: 'boltlab_streak',
  ACHIEVEMENTS: 'boltlab_achievements',
  USER_STATS: 'boltlab_user_stats',
  LEVEL_REWARDS: 'boltlab_level_rewards',
};

const XP_PER_LEVEL = 100;
const SHIELDS_PER_MONTH = 3;

export function useGamification() {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    xpToNextLevel: XP_PER_LEVEL,
  });

  const [streak, setStreak] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    streakShields: SHIELDS_PER_MONTH,
    maxShields: SHIELDS_PER_MONTH,
  });

  const [achievements, setAchievements] = useState<Achievement[]>(achievementsList);
  const [userStats, setUserStats] = useState<UserStats>({
    totalWorkouts: 0,
    totalSets: 0,
    totalDuration: 0,
    exercisesTried: [],
    joinDate: new Date(),
  });

  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      const savedLevel = localStorage.getItem(STORAGE_KEYS.USER_LEVEL);
      if (savedLevel) {
        setUserLevel(JSON.parse(savedLevel));
      }

      const savedStreak = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (savedStreak) {
        const parsed = JSON.parse(savedStreak);
        setStreak({
          ...parsed,
          lastWorkoutDate: parsed.lastWorkoutDate ? new Date(parsed.lastWorkoutDate) : null,
        });
      }

      const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (savedAchievements) {
        const parsed = JSON.parse(savedAchievements);
        setAchievements(parsed.map((ach: any) => ({
          ...ach,
          unlockedDate: ach.unlockedDate ? new Date(ach.unlockedDate) : undefined,
        })));
      }

      const savedStats = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setUserStats({
          ...parsed,
          joinDate: new Date(parsed.joinDate),
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const saveData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const calculateLevel = (totalXP: number): UserLevel => {
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const currentXP = totalXP % XP_PER_LEVEL;
    const xpToNextLevel = XP_PER_LEVEL - currentXP;

    return {
      level,
      currentXP,
      totalXP,
      xpToNextLevel,
    };
  };

  const addXP = (amount: number, source: string = 'workout') => {
    const newTotalXP = userLevel.totalXP + amount;
    const newLevel = calculateLevel(newTotalXP);
    const oldLevel = userLevel.level;

    setUserLevel(newLevel);
    saveData(STORAGE_KEYS.USER_LEVEL, newLevel);

    // Check for level up
    if (newLevel.level > oldLevel) {
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 3000);
      
      // Check for level-based achievements
      checkAchievements({ ...userStats }, newLevel.level);
    }

    return newLevel.level > oldLevel;
  };

  const updateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWorkout = streak.lastWorkoutDate ? new Date(streak.lastWorkoutDate) : null;
    if (lastWorkout) {
      lastWorkout.setHours(0, 0, 0, 0);
    }

    let newStreak = { ...streak };

    if (!lastWorkout) {
      // First workout ever
      newStreak.currentStreak = 1;
      newStreak.lastWorkoutDate = today;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, no change to streak
        return streak;
      } else if (daysDiff === 1) {
        // Next day, continue streak
        newStreak.currentStreak += 1;
        newStreak.lastWorkoutDate = today;
      } else {
        // Streak broken, reset
        newStreak.currentStreak = 1;
        newStreak.lastWorkoutDate = today;
      }
    }

    // Update longest streak
    if (newStreak.currentStreak > newStreak.longestStreak) {
      newStreak.longestStreak = newStreak.currentStreak;
    }

    setStreak(newStreak);
    saveData(STORAGE_KEYS.STREAK, newStreak);

    // Check streak achievements
    checkAchievements(userStats, userLevel.level, newStreak.currentStreak);

    return newStreak;
  };

  const completeWorkout = (exerciseIds: string[], duration: number, sets: number) => {
    // Update stats
    const newStats = {
      ...userStats,
      totalWorkouts: userStats.totalWorkouts + 1,
      totalSets: userStats.totalSets + sets,
      totalDuration: userStats.totalDuration + duration,
      exercisesTried: [...new Set([...userStats.exercisesTried, ...exerciseIds])],
    };

    setUserStats(newStats);
    saveData(STORAGE_KEYS.USER_STATS, newStats);

    // Update streak
    const newStreak = updateStreak();

    // Add XP
    let xpGained = 50; // Base workout XP
    const newExercises = exerciseIds.filter(id => !userStats.exercisesTried.includes(id));
    xpGained += newExercises.length * 25; // Bonus for new exercises

    const leveledUp = addXP(xpGained);

    // Check achievements
    checkAchievements(newStats, userLevel.level, newStreak.currentStreak);

    return { xpGained, leveledUp, newStreak };
  };

  const checkAchievements = (stats: UserStats, level: number, currentStreak?: number) => {
    const unlockedAchievements: Achievement[] = [];

    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first-steps':
          progress = Math.min(stats.totalWorkouts, 1);
          shouldUnlock = stats.totalWorkouts >= 1;
          break;
        case 'early-bird':
          progress = Math.min(stats.totalWorkouts, 5);
          shouldUnlock = stats.totalWorkouts >= 5;
          break;
        case 'getting-started':
          progress = Math.min(stats.exercisesTried.length, 5);
          shouldUnlock = stats.exercisesTried.length >= 5;
          break;
        case 'streak-warrior':
          progress = Math.min(currentStreak || 0, 7);
          shouldUnlock = (currentStreak || 0) >= 7;
          break;
        case 'consistency-king':
          progress = Math.min(currentStreak || 0, 14);
          shouldUnlock = (currentStreak || 0) >= 14;
          break;
        case 'iron-will':
          progress = Math.min(currentStreak || 0, 30);
          shouldUnlock = (currentStreak || 0) >= 30;
          break;
        case 'beast-mode':
          progress = Math.min(stats.totalWorkouts, 50);
          shouldUnlock = stats.totalWorkouts >= 50;
          break;
        case 'century-club':
          progress = Math.min(stats.totalWorkouts, 100);
          shouldUnlock = stats.totalWorkouts >= 100;
          break;
        case 'set-master':
          progress = Math.min(stats.totalSets, 500);
          shouldUnlock = stats.totalSets >= 500;
          break;
        case 'lightning-rod':
          progress = Math.min(level, 10);
          shouldUnlock = level >= 10;
          break;
        case 'thunder-god':
          progress = Math.min(level, 25);
          shouldUnlock = level >= 25;
          break;
        case 'marathon-warrior':
          progress = Math.min(stats.totalDuration, 1000);
          shouldUnlock = stats.totalDuration >= 1000;
          break;
        case 'dedication':
          progress = Math.min(currentStreak || 0, 90);
          shouldUnlock = (currentStreak || 0) >= 90;
          break;
        case 'lightning-legend':
          progress = Math.min(level, 50);
          shouldUnlock = level >= 50;
          break;
      }

      if (shouldUnlock && !achievement.unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedDate: new Date(),
          progress: achievement.maxProgress,
        };
        unlockedAchievements.push(unlockedAchievement);
        
        // Add XP reward
        addXP(achievement.xpReward, 'achievement');
        
        return unlockedAchievement;
      }

      return { ...achievement, progress };
    });

    setAchievements(updatedAchievements);
    saveData(STORAGE_KEYS.ACHIEVEMENTS, updatedAchievements);

    if (unlockedAchievements.length > 0) {
      setNewAchievements(unlockedAchievements);
      setTimeout(() => setNewAchievements([]), 5000);
    }
  };

  const useStreakShield = () => {
    if (streak.streakShields > 0) {
      const newStreak = {
        ...streak,
        streakShields: streak.streakShields - 1,
        lastWorkoutDate: new Date(),
      };
      setStreak(newStreak);
      saveData(STORAGE_KEYS.STREAK, newStreak);
      return true;
    }
    return false;
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(ach => ach.unlocked);
  };

  const getAchievementProgress = (achievementId: string) => {
    const achievement = achievements.find(ach => ach.id === achievementId);
    if (!achievement || !achievement.maxProgress) return 0;
    return ((achievement.progress || 0) / achievement.maxProgress) * 100;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#94A3B8';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  return {
    userLevel,
    streak,
    achievements,
    userStats,
    isLevelingUp,
    newAchievements,
    addXP,
    completeWorkout,
    useStreakShield,
    getUnlockedAchievements,
    getAchievementProgress,
    getRarityColor,
    checkAchievements,
  };
}