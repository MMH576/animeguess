-- This schema should be executed in the Supabase SQL Editor


-- Create tables with RLS enabled
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT scores_score_check CHECK (score >= 0)
);

CREATE TABLE public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  play_date DATE DEFAULT CURRENT_DATE,
  streak INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON public.scores(created_at);
CREATE INDEX IF NOT EXISTS plays_user_id_idx ON public.plays(user_id);
CREATE INDEX IF NOT EXISTS plays_play_date_idx ON public.plays(play_date);

-- Create policies for scores table
-- Users can insert their own scores
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.scores;
CREATE POLICY "Users can insert their scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Users can view their own scores and public scores
DROP POLICY IF EXISTS "Users can view their own scores" ON public.scores;
DROP POLICY IF EXISTS "Anyone can view top scores" ON public.scores;
CREATE POLICY "Users can view all scores" 
  ON public.scores FOR SELECT 
  USING (true);

-- Users can update their own scores
DROP POLICY IF EXISTS "Users can update their own scores" ON public.scores;
CREATE POLICY "Users can update their scores" 
  ON public.scores FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Create policies for plays table
-- Users can insert their own plays
DROP POLICY IF EXISTS "Users can insert their own plays" ON public.plays;
CREATE POLICY "Users can insert their plays" 
  ON public.plays FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Users can view all plays
DROP POLICY IF EXISTS "Users can view their own plays" ON public.plays;
CREATE POLICY "Users can view all plays" 
  ON public.plays FOR SELECT 
  USING (true);

-- Users can update their own plays
DROP POLICY IF EXISTS "Users can update their plays" ON public.plays;
CREATE POLICY "Users can update their plays" 
  ON public.plays FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Create policies for profiles table
-- Users can insert/update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view any profile
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