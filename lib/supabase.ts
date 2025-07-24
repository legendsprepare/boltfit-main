import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'boltlab-app',
    },
  },
  db: {
    schema: 'public',
  },
  // Add retries and increase timeouts
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  // Increase timeout to 60 seconds
  httpOptions: {
    timeout: 60000,
    retries: 3,
    retryDelay: 2000,
  },
});

// Database types
export interface Profile {
  id: string;
  username?: string;
  email?: string;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string;
  avatar_color: string;
  avatar_name?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  fitness_goals: string[];
  experience_level: string;
  equipment: string[];
  workout_frequency: string;
  time_availability: string;
  limitations: string[];
  limitations_other?: string;
  motivation_style: string[];
  workout_style: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutRecord {
  id: string;
  user_id: string;
  date: string;
  duration: number;
  exercises: any[];
  total_sets: number;
  xp_gained: number;
  notes?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_date: string;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  weight?: number;
  reps?: number;
  date: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type:
    | 'workout'
    | 'achievement'
    | 'streak'
    | 'joined'
    | 'personal_record';
  activity_data: {
    action: string;
    username: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface ActivityLike {
  id: string;
  user_id: string;
  activity_id: string;
  created_at: string;
}
