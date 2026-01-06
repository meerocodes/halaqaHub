/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified by Supabase:

  ## Changes

  ### 1. **Add Missing Index**
  - Add index on `qa_sessions.class_id` foreign key for better query performance

  ### 2. **Remove Unused Indexes**
  - Drop `idx_qa_sessions_open` (not being used)
  - Drop `idx_classes_qa_open` (not being used)

  ### 3. **Optimize RLS Policies**
  - Wrap all `auth.jwt()` calls with `(select auth.jwt())` to prevent re-evaluation for each row
  - This significantly improves query performance at scale
  - Affects policies on: classes, slides, qa_sessions, questions, attendance

  ### 4. **Remove Duplicate Policies**
  - Drop duplicate policies on `qa_sessions` table
  - Keep the "qa_sessions" named policies, drop the "qa sessions" versions

  ## Security
  - All RLS policies remain functionally identical
  - Admin access still properly restricted
  - Performance optimization does not change security guarantees

  ## Notes
  - Manual dashboard settings required:
    1. Switch Auth DB Connection Strategy to percentage-based
    2. Enable Leaked Password Protection in Auth settings
*/

-- ============================================
-- 1. Add Missing Foreign Key Index
-- ============================================

CREATE INDEX IF NOT EXISTS idx_qa_sessions_class ON qa_sessions(class_id);

-- ============================================
-- 2. Remove Unused Indexes
-- ============================================

DROP INDEX IF EXISTS idx_qa_sessions_open;
DROP INDEX IF EXISTS idx_classes_qa_open;

-- ============================================
-- 3. Remove Duplicate Policies on qa_sessions
-- ============================================

-- Drop the duplicate policies (ones with spaces "qa sessions")
DROP POLICY IF EXISTS "Admin can insert qa sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can update qa sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can delete qa sessions" ON qa_sessions;

-- ============================================
-- 4. Optimize RLS Policies - Classes Table
-- ============================================

DROP POLICY IF EXISTS "Admin can insert classes" ON classes;
DROP POLICY IF EXISTS "Admin can update classes" ON classes;
DROP POLICY IF EXISTS "Admin can delete classes" ON classes;

CREATE POLICY "Admin can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

-- ============================================
-- 5. Optimize RLS Policies - Slides Table
-- ============================================

DROP POLICY IF EXISTS "Admin can insert slides" ON slides;
DROP POLICY IF EXISTS "Admin can update slides" ON slides;
DROP POLICY IF EXISTS "Admin can delete slides" ON slides;

CREATE POLICY "Admin can insert slides"
  ON slides FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update slides"
  ON slides FOR UPDATE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete slides"
  ON slides FOR DELETE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

-- ============================================
-- 6. Optimize RLS Policies - QA Sessions Table
-- ============================================

DROP POLICY IF EXISTS "Admin can insert qa_sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can update qa_sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can delete qa_sessions" ON qa_sessions;

CREATE POLICY "Admin can insert qa_sessions"
  ON qa_sessions FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update qa_sessions"
  ON qa_sessions FOR UPDATE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete qa_sessions"
  ON qa_sessions FOR DELETE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

-- ============================================
-- 7. Optimize RLS Policies - Questions Table
-- ============================================

DROP POLICY IF EXISTS "Admin can update questions" ON questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON questions;

CREATE POLICY "Admin can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');

-- ============================================
-- 8. Optimize RLS Policies - Attendance Table
-- ============================================

DROP POLICY IF EXISTS "Admin can delete attendance" ON attendance;

CREATE POLICY "Admin can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (((select auth.jwt())->>'app_metadata')::jsonb->>'role' = 'admin');