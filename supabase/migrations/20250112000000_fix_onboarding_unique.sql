-- Fix onboarding_data table to ensure one row per user
-- First, remove any duplicate rows, keeping only the most recent one for each user
DELETE FROM onboarding_data 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM onboarding_data 
    ORDER BY user_id, created_at DESC
);

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE onboarding_data 
ADD CONSTRAINT onboarding_data_user_id_unique UNIQUE (user_id);

-- Add an updated_at column to track when data was last modified
ALTER TABLE onboarding_data 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_data_updated_at 
    BEFORE UPDATE ON onboarding_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 