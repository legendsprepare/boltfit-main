
-- =============================================
-- CORE TABLES
-- =============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text,
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_workout_date date,
  avatar_color text DEFAULT 'purple',
  avatar_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comprehensive onboarding_data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  -- Personal Information
  gender text,
  preferred_units text, -- 'metric' or 'imperial'
  height_cm integer, -- store everything in cm for consistency
  weight_kg decimal, -- store everything in kg for consistency
  age integer,
  -- Fitness Information
  fitness_goals text[],
  experience_level text,
  equipment text[],
  workout_frequency text,
  workout_duration text, -- preferred workout duration
  time_availability text,
  limitations text[],
  limitations_other text,
  motivation_style text[],
  workout_style text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT onboarding_data_user_id_unique UNIQUE (user_id)
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  duration integer, -- in minutes
  exercises jsonb,
  total_sets integer,
  xp_gained integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create personal_records table
CREATE TABLE IF NOT EXISTS personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  exercise_name text NOT NULL,
  weight decimal,
  reps integer,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_metadata table
CREATE TABLE IF NOT EXISTS user_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  how_did_you_hear text,
  workout_location text,
  workout_preview_time text,
  notifications_enabled boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  onboarding_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_metadata_user_id_unique UNIQUE (user_id)
);

-- =============================================
-- SOCIAL FEATURES TABLES
-- =============================================

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('workout', 'achievement', 'streak', 'joined', 'personal_record')),
  activity_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activity_likes table
CREATE TABLE IF NOT EXISTS activity_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES user_activities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =============================================
-- ONBOARDING DATA POLICIES
-- =============================================

CREATE POLICY "Users can read own onboarding data"
  ON onboarding_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own onboarding data"
  ON onboarding_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding data"
  ON onboarding_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- WORKOUTS POLICIES
-- =============================================

CREATE POLICY "Users can read own workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own workouts"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts"
  ON workouts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts"
  ON workouts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- ACHIEVEMENTS POLICIES
-- =============================================

CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- PERSONAL RECORDS POLICIES
-- =============================================

CREATE POLICY "Users can read own personal records"
  ON personal_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own personal records"
  ON personal_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own personal records"
  ON personal_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- SOCIAL FEATURES POLICIES
-- =============================================

-- Friendships policies
CREATE POLICY "Users can view their own friendships"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own friendships"
  ON friendships
  FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- User activities policies
CREATE POLICY "Users can view activities from friends"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT CASE 
        WHEN requester_id = auth.uid() THEN addressee_id 
        ELSE requester_id 
      END
      FROM friendships 
      WHERE status = 'accepted' 
      AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Activity likes policies
CREATE POLICY "Users can view all activity likes"
  ON activity_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON activity_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON activity_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- USER METADATA POLICIES
-- =============================================

CREATE POLICY "Users can read own metadata"
  ON user_metadata
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own metadata"
  ON user_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own metadata"
  ON user_metadata
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create activity when user joins
CREATE OR REPLACE FUNCTION create_join_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.id,
    'joined',
    json_build_object(
      'action', 'joined BoltLab community',
      'username', NEW.username
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create workout activity
CREATE OR REPLACE FUNCTION create_workout_activity()
RETURNS trigger AS $$
DECLARE
  user_profile profiles;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = NEW.user_id;
  
  -- Create workout activity
  INSERT INTO user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.user_id,
    'workout',
    json_build_object(
      'action', 'completed a workout',
      'username', user_profile.username,
      'duration', NEW.duration,
      'sets', NEW.total_sets,
      'xp_gained', NEW.xp_gained
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create achievement activity
CREATE OR REPLACE FUNCTION create_achievement_activity()
RETURNS trigger AS $$
DECLARE
  user_profile profiles;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = NEW.user_id;
  
  -- Create achievement activity
  INSERT INTO user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.user_id,
    'achievement',
    json_build_object(
      'action', 'earned ' || NEW.achievement_id || ' achievement',
      'username', user_profile.username,
      'achievement_id', NEW.achievement_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Trigger for profiles updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger for onboarding_data updated_at
CREATE TRIGGER update_onboarding_data_updated_at 
  BEFORE UPDATE ON onboarding_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for friendships updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_metadata updated_at
CREATE TRIGGER update_user_metadata_updated_at
  BEFORE UPDATE ON user_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user join activity
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_join_activity();

-- Trigger for workout activities
CREATE TRIGGER on_workout_completed
  AFTER INSERT ON workouts
  FOR EACH ROW EXECUTE FUNCTION create_workout_activity();

-- Trigger for achievement activities
CREATE TRIGGER on_achievement_unlocked
  AFTER INSERT ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION create_achievement_activity();

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Your BoltLab database is now ready!
-- This includes:
-- ✅ User profiles with gamification
-- ✅ Complete onboarding data (including personal info)
-- ✅ Workout tracking
-- ✅ Achievement system
-- ✅ Personal records
-- ✅ Social features (friends, activities, likes)
-- ✅ Row Level Security
-- ✅ Automatic triggers for user lifecycle events 