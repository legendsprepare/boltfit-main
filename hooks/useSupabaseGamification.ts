import { useState, useEffect } from 'react';
import { supabase, UserAchievement } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { achievementsList } from '@/data/achievements';
import { useNotifications } from './useNotifications';

// Centralized XP calculation function
export const calculateWorkoutXP = (
  sets: number,
  duration: number = 0,
  exerciseCount: number = 1
): number => {
  const baseXP = 50; // Base workout completion XP
  const perSetBonus = 5; // XP bonus per set completed

  return baseXP + sets * perSetBonus;
};

// Helper function to calculate total XP needed for a given level
export const calculateTotalXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // Formula: 100 * (level-1) * level / 2
  // This gives us: Level 2=100, Level 3=300, Level 4=600, etc.
  return (100 * (level - 1) * level) / 2;
};

// Helper function to calculate what level a given total XP corresponds to
export const calculateLevelFromXP = (totalXP: number): number => {
  if (totalXP < 100) return 1;

  // Use quadratic formula to solve: 100 * (level-1) * level / 2 = totalXP
  // Rearranged: level^2 - level - (2*totalXP/100) = 0
  // level = (1 + sqrt(1 + 8*totalXP/100)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2);
  return Math.max(1, level);
};

// Helper function to get XP progress within current level
export const getLevelProgress = (
  totalXP: number
): { currentXP: number; maxXP: number; level: number } => {
  const level = calculateLevelFromXP(totalXP);
  const currentLevelStartXP = calculateTotalXPForLevel(level);
  const nextLevelStartXP = calculateTotalXPForLevel(level + 1);

  return {
    currentXP: totalXP - currentLevelStartXP,
    maxXP: nextLevelStartXP - currentLevelStartXP,
    level: level,
  };
};

export function useSupabaseGamification() {
  const { user, profile, updateProfile } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading achievements:', error);
      } else {
        setUserAchievements(data || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const addXP = async (amount: number) => {
    if (!profile) return false;

    const newTotalXP = profile.total_xp + amount;
    const currentLevel = profile.level;

    // Use new progressive leveling system
    const newLevel = calculateLevelFromXP(newTotalXP);

    const leveledUp = newLevel > currentLevel;

    console.log(
      `Adding ${amount} XP. Total: ${newTotalXP}, Level: ${currentLevel} → ${newLevel}`
    );

    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
      })
      .eq('id', profile.id);

    if (!error) {
      updateProfile({
        total_xp: newTotalXP,
        level: newLevel,
      });
    }

    return leveledUp;
  };

  const updateStreak = async () => {
    if (!user || !profile) return profile;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('=== STREAK UPDATE DEBUG ===');
    console.log('Today:', todayString);
    console.log('Last workout date from profile:', profile.last_workout_date);
    console.log('Current streak:', profile.current_streak);

    const lastWorkoutDateString = profile.last_workout_date;

    let newStreak = profile.current_streak;
    let newLongestStreak = profile.longest_streak;

    if (!lastWorkoutDateString) {
      // First workout ever
      console.log('First workout ever, setting streak to 1');
      newStreak = 1;
    } else {
      // Compare date strings directly to avoid timezone issues
      console.log(
        'Comparing dates - Today:',
        todayString,
        'Last workout:',
        lastWorkoutDateString
      );

      if (lastWorkoutDateString === todayString) {
        // Same day, update the last workout date but don't change streak
        console.log('Same day workout - no streak change');
        // Streak stays the same, just update the date
      } else {
        // Calculate days difference using string comparison
        const todayDate = new Date(todayString);
        const lastWorkoutDate = new Date(lastWorkoutDateString);
        const daysDiff = Math.floor(
          (todayDate.getTime() - lastWorkoutDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        console.log('Days difference:', daysDiff);

        if (daysDiff === 1) {
          // Next day, increment streak
          newStreak = profile.current_streak + 1;
          console.log(
            `Next day workout - incrementing streak from ${profile.current_streak} to ${newStreak}`
          );
        } else if (daysDiff === 2) {
          // One rest day, maintain streak
          console.log('One rest day - maintaining streak');
          // Streak stays the same, but update date
        } else if (daysDiff > 2) {
          // 2+ rest days (3+ day gap), reset streak
          newStreak = 1;
          console.log(`${daysDiff} day gap - resetting streak to 1`);
        } else {
          // Past date or negative difference, something went wrong
          console.log('Invalid date difference, maintaining current streak');
        }
      }
    }

    // Update longest streak if necessary
    if (newStreak > profile.longest_streak) {
      newLongestStreak = newStreak;
      console.log('New longest streak:', newLongestStreak);
    }

    console.log('Updating profile with:', {
      current_streak: newStreak,
      last_workout_date: todayString,
      longest_streak: newLongestStreak,
    });
    console.log('=== END STREAK DEBUG ===');

    // Update the profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        last_workout_date: todayString,
        longest_streak: newLongestStreak,
      })
      .eq('id', profile.id);

    if (!error) {
      updateProfile({
        current_streak: newStreak,
        last_workout_date: todayString,
        longest_streak: newLongestStreak,
      });
    }

    return profile;
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    // Check if already unlocked
    const alreadyUnlocked = userAchievements.some(
      (ach) => ach.achievement_id === achievementId
    );

    if (alreadyUnlocked) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
      })
      .select()
      .single();

    if (!error && data) {
      setUserAchievements((prev) => [...prev, data]);

      // Award XP for achievement
      const achievement = achievementsList.find((a) => a.id === achievementId);
      if (achievement) {
        await addXP(achievement.xpReward);
      }
    }

    return { data, error };
  };

  const checkAchievements = async (stats: {
    totalWorkouts: number;
    currentStreak: number;
    totalSets: number;
    exercisesTried: number;
  }) => {
    const newAchievements: string[] = [];

    for (const achievement of achievementsList) {
      const alreadyUnlocked = userAchievements.some(
        (ach) => ach.achievement_id === achievement.id
      );

      if (alreadyUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first-steps':
          shouldUnlock = stats.totalWorkouts >= 1;
          break;
        case 'early-bird':
          shouldUnlock = stats.totalWorkouts >= 5;
          break;
        case 'getting-started':
          shouldUnlock = stats.exercisesTried >= 5;
          break;
        case 'streak-warrior':
          shouldUnlock = stats.currentStreak >= 7;
          break;
        case 'consistency-king':
          shouldUnlock = stats.currentStreak >= 14;
          break;
        case 'iron-will':
          shouldUnlock = stats.currentStreak >= 30;
          break;
        case 'beast-mode':
          shouldUnlock = stats.totalWorkouts >= 50;
          break;
        case 'century-club':
          shouldUnlock = stats.totalWorkouts >= 100;
          break;
        case 'set-master':
          shouldUnlock = stats.totalSets >= 500;
          break;
        case 'lightning-rod':
          shouldUnlock = (profile?.level || 1) >= 10;
          break;
        case 'thunder-god':
          shouldUnlock = (profile?.level || 1) >= 25;
          break;
        case 'lightning-legend':
          shouldUnlock = (profile?.level || 1) >= 50;
          break;
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement.id);
        newAchievements.push(achievement.id);
      }
    }

    return newAchievements;
  };

  const completeWorkout = async (
    exerciseIds: string[],
    duration: number,
    sets: number
  ) => {
    if (!profile) return { xpGained: 0, leveledUp: false };

    // Update streak
    await updateStreak();

    // Calculate XP using centralized function
    const xpGained = calculateWorkoutXP(sets, duration, exerciseIds.length);

    console.log(`Awarding XP: ${xpGained} (50 base + ${sets} sets × 5)`);

    const leveledUp = await addXP(xpGained);

    // Check for achievements
    const stats = {
      totalWorkouts: (profile.total_xp + xpGained) / 50, // Rough estimate
      currentStreak: profile.current_streak + 1,
      totalSets: sets,
      exercisesTried: exerciseIds.length,
    };

    await checkAchievements(stats);

    return { xpGained, leveledUp };
  };

  const getUnlockedAchievements = () => {
    return achievementsList.filter((achievement) =>
      userAchievements.some(
        (userAch) => userAch.achievement_id === achievement.id
      )
    );
  };

  return {
    userAchievements,
    loading,
    addXP,
    updateStreak,
    unlockAchievement,
    checkAchievements,
    completeWorkout,
    getUnlockedAchievements,
  };
}
