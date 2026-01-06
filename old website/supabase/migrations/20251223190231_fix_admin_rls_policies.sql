/*
  # Fix Admin RLS Policies

  ## Changes
  
  1. **Classes Table Policies**
    - Update admin policies to check `app_metadata.role` instead of top-level `role`
    
  2. **Slides Table Policies**
    - Update admin policies to check `app_metadata.role` instead of top-level `role`
    
  3. **Q&A Sessions Table Policies**
    - Update admin policies to check `app_metadata.role` instead of top-level `role`
    
  4. **Questions Table Policies**
    - Update admin policies to check `app_metadata.role` instead of top-level `role`

  ## Security
    - Ensures admin users (identified by app_metadata.role = 'admin') have proper access
    - Maintains public read access and controlled write access
    
  ## Notes
    - The JWT token stores role in `app_metadata` not at top level
    - Fixes issue where admin users couldn't create/update/delete content
*/

-- Drop old policies and recreate with correct JWT path

-- Classes policies
DROP POLICY IF EXISTS "Admin can insert classes" ON classes;
DROP POLICY IF EXISTS "Admin can update classes" ON classes;
DROP POLICY IF EXISTS "Admin can delete classes" ON classes;

CREATE POLICY "Admin can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

-- Slides policies
DROP POLICY IF EXISTS "Admin can insert slides" ON slides;
DROP POLICY IF EXISTS "Admin can update slides" ON slides;
DROP POLICY IF EXISTS "Admin can delete slides" ON slides;

CREATE POLICY "Admin can insert slides"
  ON slides FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update slides"
  ON slides FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete slides"
  ON slides FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

-- QA Sessions policies
DROP POLICY IF EXISTS "Admin can insert qa_sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can update qa_sessions" ON qa_sessions;
DROP POLICY IF EXISTS "Admin can delete qa_sessions" ON qa_sessions;

CREATE POLICY "Admin can insert qa_sessions"
  ON qa_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can update qa_sessions"
  ON qa_sessions FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete qa_sessions"
  ON qa_sessions FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

-- Questions policies (admin only update/delete)
DROP POLICY IF EXISTS "Admin can update questions" ON questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON questions;

CREATE POLICY "Admin can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin')
  WITH CHECK ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');

CREATE POLICY "Admin can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin');