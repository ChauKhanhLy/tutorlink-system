-- SQL commands to update database schema and bookings for review
-- Run these directly in pgAdmin, DBeaver, or your PostgreSQL tool

-- ============================================
-- PART 1: Update reviews table schema
-- ============================================

-- 1. Check current reviews table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- 2. Make booking_id nullable (required for tutor reviews)
ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;

-- 3. Add review_type column if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_type VARCHAR(20) DEFAULT 'session';

-- 4. Add tutor_id column if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tutor_id UUID;

-- 5. Add subject_id column if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS subject_id UUID;

-- 6. Add check constraint for review_type (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'reviews_review_type_check'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_review_type_check
            CHECK (review_type IN ('session', 'tutor'));
    END IF;
END $$;

-- 7. Verify the reviews table structure after updates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- ============================================
-- PART 2: Update bookings for review
-- ============================================

-- 7. First, check the user
SELECT id, email FROM users WHERE id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add';

-- 8. Check bookings before today for this user
SELECT id, datetime, status, tutor_id, subject_id
FROM bookings
WHERE learner_id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add'
AND datetime < CURRENT_DATE
AND status != 'cancelled'
ORDER BY datetime ASC;

-- 9. Update bookings to completed
UPDATE bookings
SET status = 'completed'
WHERE learner_id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add'
AND datetime < CURRENT_DATE
AND status != 'cancelled'
AND status != 'completed';

-- 10. Check if lesson_sessions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'lesson_sessions'
) as table_exists;

-- 11. If lesson_sessions table exists, create records for bookings that don't have one
-- Only run this if step 10 returns true
INSERT INTO lesson_sessions (booking_id, session_date, start_time, end_time, duration_hours, tutor_confirmed, learner_confirmed, attended, status)
SELECT
    b.id,
    DATE(b.datetime) as session_date,
    b.datetime as start_time,
    CASE
        WHEN b.type = 'trial' THEN b.datetime + INTERVAL '1 hour'
        ELSE b.datetime + INTERVAL '2 hours'
    END as end_time,
    CASE
        WHEN b.type = 'trial' THEN 1
        ELSE 2
    END as duration_hours,
    TRUE as tutor_confirmed,
    TRUE as learner_confirmed,
    TRUE as attended,
    'completed' as status
FROM bookings b
WHERE b.learner_id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add'
AND b.datetime < CURRENT_DATE
AND b.status = 'completed'
AND b.status != 'cancelled'
AND NOT EXISTS (
    SELECT 1 FROM lesson_sessions ls WHERE ls.booking_id = b.id
);

-- 12. Update existing lesson_sessions to confirmed
-- Only run this if lesson_sessions table exists
UPDATE lesson_sessions
SET tutor_confirmed = true,
    learner_confirmed = true,
    attended = true,
    status = 'completed',
    updated_at = CURRENT_TIMESTAMP
WHERE booking_id IN (
  SELECT id FROM bookings
  WHERE learner_id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add'
  AND datetime < CURRENT_DATE
  AND status != 'cancelled'
);

-- 13. Verify the updates
SELECT b.id, b.datetime, b.status,
       ls.tutor_confirmed, ls.learner_confirmed, ls.attended, ls.status
FROM bookings b
LEFT JOIN lesson_sessions ls ON b.id = ls.booking_id
WHERE b.learner_id = 'fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add'
AND b.datetime < CURRENT_DATE
ORDER BY b.datetime ASC;

