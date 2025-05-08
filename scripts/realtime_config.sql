-- Configure realtime for the scores table

-- Ensure the publication exists and publishes all changes
DO $$
DECLARE
  publication_exists BOOLEAN;
BEGIN
  -- Check if publication exists
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO publication_exists;
  
  IF NOT publication_exists THEN
    -- Create the publication if it doesn't exist
    EXECUTE 'CREATE PUBLICATION supabase_realtime FOR TABLE public.scores';
    RAISE NOTICE 'Created supabase_realtime publication for scores table';
  ELSE
    -- Check if scores table is in the publication
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'scores'
    ) THEN
      -- Add scores table to the publication
      ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
      RAISE NOTICE 'Added scores table to supabase_realtime publication';
    ELSE
      RAISE NOTICE 'scores table is already in the supabase_realtime publication';
    END IF;
  END IF;
  
  -- Configure the publication to publish all changes
  ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');
  RAISE NOTICE 'Set supabase_realtime publication to publish all changes';
END
$$;

-- Create a simple policy for realtime
DROP POLICY IF EXISTS "Enable realtime for all users" ON public.scores;
CREATE POLICY "Enable realtime for all users" 
  ON public.scores 
  FOR SELECT 
  USING (true);

-- Check realtime status of supabase_realtime publication
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime'; 