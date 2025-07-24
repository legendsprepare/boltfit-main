-- Add personal information fields to onboarding_data table
ALTER TABLE onboarding_data 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS preferred_units text, -- 'metric' or 'imperial'
ADD COLUMN IF NOT EXISTS height_cm integer, -- store everything in cm for consistency
ADD COLUMN IF NOT EXISTS weight_kg decimal, -- store everything in kg for consistency
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS workout_duration text; -- preferred workout duration 