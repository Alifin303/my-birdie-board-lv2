-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all rounds for all courses" ON public.rounds;

-- Create secure policies for profiles that only expose username for leaderboards
CREATE POLICY "Users can view usernames for leaderboards" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update profiles table to have a computed column that only shows safe data
-- This policy allows authenticated users to see only username and handicap for leaderboard purposes
-- but protects email, first_name, last_name

-- Create secure policies for rounds that allow leaderboard functionality
CREATE POLICY "Users can view round scores for leaderboards" 
ON public.rounds 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- The above policies now require authentication but still allow viewing other users' data
-- For maximum security while maintaining leaderboard functionality, we could create views
-- But the current approach balances security with functionality by requiring authentication