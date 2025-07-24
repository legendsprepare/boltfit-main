import { useState, useEffect } from 'react';
import { CompletedWorkout, WorkoutPreferences } from '@/types/workout';

const WORKOUT_HISTORY_KEY = 'boltlab_workout_history';
const WORKOUT_PREFERENCES_KEY = 'boltlab_workout_preferences';

const defaultPreferences: WorkoutPreferences = {
  defaultRestTime: 60,
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartRest: true,
};

export function useWorkoutStorage() {
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkout[]>([]);
  const [preferences, setPreferences] = useState<WorkoutPreferences>(defaultPreferences);

  // Load data on mount
  useEffect(() => {
    loadWorkoutHistory();
    loadPreferences();
  }, []);

  const loadWorkoutHistory = () => {
    try {
      const stored = localStorage.getItem(WORKOUT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const workouts = parsed.map((workout: any) => ({
          ...workout,
          date: new Date(workout.date),
        }));
        setWorkoutHistory(workouts);
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(WORKOUT_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveWorkout = (workout: CompletedWorkout) => {
    try {
      const updatedHistory = [workout, ...workoutHistory];
      setWorkoutHistory(updatedHistory);
      localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const updatePreferences = (newPreferences: Partial<WorkoutPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      localStorage.setItem(WORKOUT_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const getWorkoutStats = () => {
    const totalWorkouts = workoutHistory.length;
    const totalDuration = workoutHistory.reduce((sum, workout) => sum + workout.duration, 0);
    const totalSets = workoutHistory.reduce((sum, workout) => sum + workout.totalSets, 0);
    const totalXP = workoutHistory.reduce((sum, workout) => sum + workout.xpGained, 0);

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < workoutHistory.length; i++) {
      const workoutDate = new Date(workoutHistory[i].date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalWorkouts,
      totalDuration,
      totalSets,
      totalXP,
      currentStreak,
      averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
    };
  };

  const getRecentWorkouts = (limit: number = 5) => {
    return workoutHistory.slice(0, limit);
  };

  return {
    workoutHistory,
    preferences,
    saveWorkout,
    updatePreferences,
    getWorkoutStats,
    getRecentWorkouts,
  };
}