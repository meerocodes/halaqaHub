/*
  # Track which user checked into attendance

  ## Changes
  - Add `user_id` column to `attendance` referencing auth.users
  - Enforce unique attendance per (class_id, user_id) when user_id is present
*/

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_class_user_unique
  ON attendance(class_id, user_id)
  WHERE user_id IS NOT NULL;
