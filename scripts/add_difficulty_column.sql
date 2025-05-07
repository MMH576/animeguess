-- Add difficulty column to scores table
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal';

-- Create an index on the difficulty column for faster filtering
CREATE INDEX IF NOT EXISTS scores_difficulty_idx ON public.scores(difficulty);

-- Update any existing scores to use 'normal' difficulty
UPDATE public.scores SET difficulty = 'normal' WHERE difficulty IS NULL;

-- You can run this command in the Supabase SQL Editor when you're ready to add difficulty support  