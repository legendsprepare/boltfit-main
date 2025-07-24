import { useState, useEffect } from 'react';
import { AvatarLevel, AvatarColor } from '@/components/LightningAvatar';

interface AvatarState {
  level: AvatarLevel;
  xp: number;
  maxXp: number;
  color: AvatarColor;
  totalWorkouts: number;
  achievements: number;
}

interface UseAvatarSystemReturn {
  avatarState: AvatarState;
  addXP: (amount: number) => void;
  completeWorkout: () => void;
  unlockAchievement: () => void;
  changeColor: (color: AvatarColor) => void;
  isLevelingUp: boolean;
}

const levelThresholds = {
  'spark': 100,
  'bolt': 300,
  'storm': 600,
  'thunder-god': 1000,
};

const levelOrder: AvatarLevel[] = ['spark', 'bolt', 'storm', 'thunder-god'];

export function useAvatarSystem(): UseAvatarSystemReturn {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    level: 'spark',
    xp: 45,
    maxXp: 100,
    color: 'purple',
    totalWorkouts: 24,
    achievements: 12,
  });

  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const calculateLevel = (totalXP: number): { level: AvatarLevel; currentXP: number; maxXP: number } => {
    let currentLevel: AvatarLevel = 'spark';
    let currentXP = totalXP;
    
    for (const level of levelOrder) {
      const threshold = levelThresholds[level];
      if (totalXP >= threshold) {
        currentLevel = level;
        currentXP = totalXP - threshold;
      } else {
        break;
      }
    }

    const currentLevelIndex = levelOrder.indexOf(currentLevel);
    const nextLevel = levelOrder[currentLevelIndex + 1];
    const maxXP = nextLevel ? levelThresholds[nextLevel] - levelThresholds[currentLevel] : 100;

    return { level: currentLevel, currentXP, maxXP };
  };

  const addXP = (amount: number) => {
    setAvatarState(prev => {
      const newTotalXP = prev.xp + amount;
      const { level, currentXP, maxXP } = calculateLevel(newTotalXP);
      
      if (level !== prev.level) {
        setIsLevelingUp(true);
        setTimeout(() => setIsLevelingUp(false), 2000);
      }

      return {
        ...prev,
        level,
        xp: currentXP,
        maxXp: maxXP,
      };
    });
  };

  const completeWorkout = () => {
    setAvatarState(prev => ({
      ...prev,
      totalWorkouts: prev.totalWorkouts + 1,
    }));
    addXP(25); // Base XP for completing a workout
  };

  const unlockAchievement = () => {
    setAvatarState(prev => ({
      ...prev,
      achievements: prev.achievements + 1,
    }));
    addXP(50); // Bonus XP for achievements
  };

  const changeColor = (color: AvatarColor) => {
    setAvatarState(prev => ({
      ...prev,
      color,
    }));
  };

  return {
    avatarState,
    addXP,
    completeWorkout,
    unlockAchievement,
    changeColor,
    isLevelingUp,
  };
}