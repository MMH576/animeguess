-- Migration to remove test users from the scores table
BEGIN;

-- Delete all entries where user_id starts with 'test-user'
DELETE FROM public.scores 
WHERE user_id LIKE 'test-user%';

-- Delete entries that look like test data (Player te)
DELETE FROM public.scores
WHERE username = 'Player te' OR username LIKE 'Test User%';

COMMIT; 