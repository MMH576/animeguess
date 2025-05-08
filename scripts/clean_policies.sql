-- Clean up and set correct policies for all tables

-- 1. Plays table
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Clear existing policies for plays
DROP POLICY IF EXISTS "Users can insert their plays" ON public.plays;
DROP POLICY IF EXISTS "Users can insert their own plays" ON public.plays;
DROP POLICY IF EXISTS "Users can update their plays" ON public.plays;
DROP POLICY IF EXISTS "Users can update their own plays" ON public.plays;
DROP POLICY IF EXISTS "Users can view all plays" ON public.plays;
DROP POLICY IF EXISTS "Users can view their own plays" ON public.plays;
DROP POLICY IF EXISTS "Enable realtime broadcasts for authenticated users" ON public.plays;
DROP POLICY IF EXISTS "Enable realtime for all users" ON public.plays;

-- Create clean policies for plays
CREATE POLICY "Enable realtime for all users" 
  ON public.plays 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own plays" 
  ON public.plays 
  FOR ALL 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 2. Profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear existing policies for profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;

-- Create clean policies for profiles
CREATE POLICY "Users can view any profile" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 3. Scores table
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Clear existing policies for scores
DROP POLICY IF EXISTS "Anyone can view top scores" ON public.scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.scores;
DROP POLICY IF EXISTS "Users can insert their scores" ON public.scores;
DROP POLICY IF EXISTS "insert your own scores" ON public.scores;
DROP POLICY IF EXISTS "Users can update their own scores" ON public.scores;
DROP POLICY IF EXISTS "Users can update their scores" ON public.scores;
DROP POLICY IF EXISTS "Users can view all scores" ON public.scores;
DROP POLICY IF EXISTS "Users can view their own scores" ON public.scores;

-- Create clean policies for scores
CREATE POLICY "Enable realtime for all users" 
  ON public.scores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own scores" 
  ON public.scores 
  FOR ALL 
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Ensure realtime is enabled for all tables
DO $$
DECLARE
  table_exists BOOLEAN;
  publication_exists BOOLEAN;
BEGIN
  -- Check if the publication exists
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO publication_exists;
  
  IF NOT publication_exists THEN
    -- Create the publication if it doesn't exist
    EXECUTE 'CREATE PUBLICATION supabase_realtime FOR ALL TABLES';
    RAISE NOTICE 'Created supabase_realtime publication for all tables';
  ELSE
    -- Make sure each table is in the publication
    -- Check scores table
    SELECT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'scores'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
      RAISE NOTICE 'Added scores table to supabase_realtime publication';
    END IF;
    
    -- Check plays table
    SELECT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'plays'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.plays;
      RAISE NOTICE 'Added plays table to supabase_realtime publication';
    END IF;
    
    -- Check profiles table
    SELECT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'profiles'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
      RAISE NOTICE 'Added profiles table to supabase_realtime publication';
    END IF;
  END IF;
  
  -- Ensure publication is set to publish all changes
  ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');
  RAISE NOTICE 'Set supabase_realtime publication to publish all changes';
END
$$; 