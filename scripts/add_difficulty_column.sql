-- DEPRECATED: This file is no longer needed as the difficulty column is now part of the main schema.
-- The difficulty column has been integrated into both create_tables.sql and supabase/schema.sql.

-- Original content:
-- Add difficulty column to scores table
-- ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal';

-- Create an index on the difficulty column for faster filtering
-- CREATE INDEX IF NOT EXISTS scores_difficulty_idx ON public.scores(difficulty);

-- Update any existing scores to use 'normal' difficulty
-- UPDATE public.scores SET difficulty = 'normal' WHERE difficulty IS NULL;

-- You can run this command in the Supabase SQL Editor when you're ready to add difficulty support  