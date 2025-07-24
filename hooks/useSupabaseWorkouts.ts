import { useState, useEffect } from 'react';
import { supabase, WorkoutRecord, PersonalRecord } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSupabaseWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadPersonalRecords();
    }
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading workouts:', error);
      } else {
        setWorkouts(data || []);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading personal records:', error);
      } else {
        setPersonalRecords(data || []);
      }
    } catch (error) {
      console.error('Error loading personal records:', error);
    }
  };

  const saveWorkout = async (workoutData: {
    duration: number;
    exercises: any[];
    total_sets: number;
    xp_gained: number;
    notes?: string;
  }) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        ...workoutData,
      })
      .select()
      .single();

    if (!error && data) {
      setWorkouts(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const savePersonalRecord = async (prData: {
    exercise_id: string;
    exercise_name: string;
    weight?: number;
    reps?: number;
  }) => {
    if (!user) return { error: new Error('No user logged in') };

    // Check if this is actually a new PR
    const existingPR = personalRecords.find(
      pr => pr.exercise_id === prData.exercise_id
    );

    const isNewPR = !existingPR || 
      (prData.weight && prData.weight > (existingPR.weight || 0));

    if (!isNewPR) {
      return { data: null, error: null }; // Not a new PR
    }

    const { data, error } = await supabase
      .from('personal_records')
      .insert({
        user_id: user.id,
        ...prData,
      })
      .select()
      .single();

    if (!error && data) {
      setPersonalRecords(prev => [data, ...prev]);
    }

    return { data, error, isNewPR };
  };

  const getWorkoutStats = () => {
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const totalSets = workouts.reduce((sum, workout) => sum + workout.total_sets, 0);
    const totalXP = workouts.reduce((sum, workout) => sum + workout.xp_gained, 0);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
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
    return workouts.slice(0, limit);
  };

  const getRecentPersonalRecords = (limit: number = 5) => {
    return personalRecords.slice(0, limit);
  };

  return {
    workouts,
    personalRecords,
    loading,
    saveWorkout,
    savePersonalRecord,
    getWorkoutStats,
    getRecentWorkouts,
    getRecentPersonalRecords,
    loadWorkouts,
    loadPersonalRecords,
  };
}