/*
  # Create social features schema

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `requester_id` (uuid, references profiles)
      - `addressee_id` (uuid, references profiles)
      - `status` (text: 'pending', 'accepted', 'blocked')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity_type` (text: 'workout', 'achievement', 'streak', 'joined', 'personal_record')
      - `activity_data` (jsonb)
      - `created_at` (timestamp)
    
    - `activity_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity_id` (uuid, references user_activities)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

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

-- Enable Row Level Security
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for friendships
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

-- Create policies for user_activities
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

-- Create policies for activity_likes
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

-- Create trigger for friendships updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create activity when user joins
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

-- Create trigger for new user join activity
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_join_activity();

-- Create function to create workout activity
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

-- Create trigger for workout activities
CREATE TRIGGER on_workout_completed
  AFTER INSERT ON workouts
  FOR EACH ROW EXECUTE FUNCTION create_workout_activity();

-- Create function to create achievement activity
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

-- Create trigger for achievement activities
CREATE TRIGGER on_achievement_unlocked
  AFTER INSERT ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION create_achievement_activity(); 