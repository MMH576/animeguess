-- This schema should be executed in the Supabase SQL Editor


-- Create tables with RLS enabled
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT scores_score_check CHECK (score >= 0)
);

CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  play_date DATE DEFAULT CURRENT_DATE,
  streak INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON public.scores(created_at);
CREATE INDEX IF NOT EXISTS scores_difficulty_idx ON public.scores(difficulty);
CREATE INDEX IF NOT EXISTS plays_user_id_idx ON public.plays(user_id);
CREATE INDEX IF NOT EXISTS plays_play_date_idx ON public.plays(play_date);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for scores table
-- Users can insert their own scores
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.scores;
CREATE POLICY "Users can insert their own scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view their own scores
DROP POLICY IF EXISTS "Users can view their own scores" ON public.scores;
CREATE POLICY "Users can view their own scores" 
  ON public.scores FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Anyone can view top scores (for leaderboard)
DROP POLICY IF EXISTS "Anyone can view top scores" ON public.scores;
CREATE POLICY "Anyone can view top scores" 
  ON public.scores FOR SELECT 
  USING (true);

-- Users can update their own scores
DROP POLICY IF EXISTS "Users can update their own scores" ON public.scores;
CREATE POLICY "Users can update their own scores" 
  ON public.scores FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Create policies for plays table
-- Users can insert their own plays
DROP POLICY IF EXISTS "Users can insert their own plays" ON public.plays;
CREATE POLICY "Users can insert their own plays" 
  ON public.plays FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view their own plays
DROP POLICY IF EXISTS "Users can view their own plays" ON public.plays;
CREATE POLICY "Users can view their own plays" 
  ON public.plays FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Users can update their own plays
DROP POLICY IF EXISTS "Users can update their own plays" ON public.plays;
CREATE POLICY "Users can update their own plays" 
  ON public.plays FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Create policies for profiles table
-- Users can insert/update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view any profile
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;
CREATE POLICY "Users can view any profile" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Create an RPC function for average scores
CREATE OR REPLACE FUNCTION public.get_average_scores_per_user()
RETURNS TABLE (user_id TEXT, average_score DOUBLE PRECISION) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT user_id, AVG(score) as average_score
  FROM public.scores
  GROUP BY user_id
  ORDER BY average_score DESC;
$$; 