-- TEMPORARY FIX: Disable trigger to allow signup without database dependencies
-- Run this if the main fix doesn't work

-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Optionally disable RLS temporarily for testing
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE onboarding_data DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY; 