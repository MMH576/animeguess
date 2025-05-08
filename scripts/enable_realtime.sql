-- Enable Realtime for Scores Table
-- Run this script in the Supabase SQL Editor after running create_tables.sql

-- 1. Ensure the scores table exists
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT scores_score_check CHECK (score >= 0)
);

-- 2. Create the publication if it doesn't exist (required for Realtime)
-- Using DO block since CREATE PUBLICATION doesn't support IF NOT EXISTS
DO $$
BEGIN
  -- Check if the publication already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Create the publication
    EXECUTE 'CREATE PUBLICATION supabase_realtime FOR TABLE public.scores';
    RAISE NOTICE 'Created supabase_realtime publication';
  ELSE
    RAISE NOTICE 'supabase_realtime publication already exists';
  END IF;
END
$$;

-- 3. Add the scores table to the publication if it's not already there
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if scores table is already in the publication
  SELECT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'scores'
  ) INTO table_exists;
  
  -- If not in publication, add it
  IF NOT table_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
    RAISE NOTICE 'Added scores table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'scores table is already in the supabase_realtime publication';
  END IF;
END
$$;

-- 4. Ensure RLS policies exist for the scores table
-- These policies are already in create_tables.sql, but adding here for completeness
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for leaderboard)
DROP POLICY IF EXISTS "Anyone can view top scores" ON public.scores;
CREATE POLICY "Anyone can view top scores" 
  ON public.scores FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own scores
DROP POLICY IF EXISTS "Users can insert their scores" ON public.scores;
CREATE POLICY "Users can insert their scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 5. Special step for Supabase Realtime - ensure the webhook table has at least one row
-- This is often needed to "wake up" the Realtime system for a new schema/table
INSERT INTO public.scores (user_id, score, difficulty)
VALUES ('test-realtime-setup', 1, 'normal')
ON CONFLICT DO NOTHING;

-- After running this script:
-- 1. Go to Database → Replication in Supabase dashboard
-- 2. Scroll down to the Realtime section
-- 3. Enable realtime for the scores table if it's not already enabled
-- 4. Go to Realtime in the sidebar and create a policy that allows all users to access realtime events 