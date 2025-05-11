-- Add username column to scores table if it doesn't exist
BEGIN;

-- Check if the column exists first to prevent errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scores' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.scores 
        ADD COLUMN username TEXT;
    END IF;
END $$;

COMMIT; 