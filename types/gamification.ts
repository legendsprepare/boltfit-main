export interface UserLevel {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  streakShields: number;
  maxShields: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalSets: number;
  totalDuration: number; // in minutes
  exercisesTried: string[];
  favoriteExercise?: string;
  joinDate: Date;
}

export interface LevelReward {
  level: number;
  type: 'avatar_evolution' | 'customization' | 'shield' | 'special';
  description: string;
  unlocked: boolean;
}