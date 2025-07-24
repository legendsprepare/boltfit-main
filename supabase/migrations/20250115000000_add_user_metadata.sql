-- Add user_metadata table for storing additional onboarding information
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

-- Enable Row Level Security
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_metadata
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

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_user_metadata_updated_at
  BEFORE UPDATE ON user_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 