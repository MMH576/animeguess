-- Configure realtime - simplified version without complex quoting

-- First, ensure the publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    EXECUTE 'CREATE PUBLICATION supabase_realtime FOR TABLE scores';
  END IF;
END $$;

-- Make sure scores table is in the publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'scores'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE scores';
  END IF;
END $$;

-- Configure the publication to broadcast all changes
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime SET (publish = ''insert, update, delete'')';
END $$;

-- Drop existing realtime policy if exists
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS realtime_policy ON scores';
END $$;

-- Create simple realtime policy
DO $$
BEGIN
  EXECUTE 'CREATE POLICY realtime_policy ON scores FOR SELECT USING (true)';
END $$;

-- Check realtime status
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'; 