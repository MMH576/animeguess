-- Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT scores_score_check CHECK (score >= 0)
);

-- Plays Table (for tracking daily plays and streaks)
CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  play_date DATE DEFAULT CURRENT_DATE,
  streak INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON public.scores(created_at);
CREATE INDEX IF NOT EXISTS plays_user_id_idx ON public.plays(user_id);
CREATE INDEX IF NOT EXISTS plays_play_date_idx ON public.plays(play_date);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scores
DROP POLICY IF EXISTS "Users can view all scores" ON public.scores;
CREATE POLICY "Users can view all scores" 
  ON public.scores FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their scores" ON public.scores;
CREATE POLICY "Users can insert their scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their scores" ON public.scores;
CREATE POLICY "Users can update their scores" 
  ON public.scores FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- RLS Policies for plays
DROP POLICY IF EXISTS "Users can view all plays" ON public.plays;
CREATE POLICY "Users can view all plays" 
  ON public.plays FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their plays" ON public.plays;
CREATE POLICY "Users can insert their plays" 
  ON public.plays FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their plays" ON public.plays;
CREATE POLICY "Users can update their plays" 
  ON public.plays FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role'); 