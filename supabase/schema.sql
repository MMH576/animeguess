-- This schema should be executed in the Supabase SQL Editor


-- Create tables with RLS enabled
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
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

-- Create policies for scores table
-- Users can insert their own scores
CREATE POLICY "Users can insert their own scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view their own scores
CREATE POLICY "Users can view their own scores" 
  ON public.scores FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Anyone can view top scores (for leaderboard)
CREATE POLICY "Anyone can view top scores" 
  ON public.scores FOR SELECT 
  USING (true);

-- Create policies for plays table
-- Users can insert their own plays
CREATE POLICY "Users can insert their own plays" 
  ON public.plays FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view their own plays
CREATE POLICY "Users can view their own plays" 
  ON public.plays FOR SELECT 
  USING (auth.uid()::text = user_id);

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