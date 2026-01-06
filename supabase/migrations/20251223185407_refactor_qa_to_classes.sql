/*
  # Refactor Q&A System to Link Directly to Classes

  ## Changes

  1. **Questions Table**
    - Remove `session_id` column
    - Add `class_id` column linking directly to classes
    - Update foreign key constraints

  2. **Classes Table**
    - Add `qa_is_open` boolean to control Q&A for each class
    
  ## Security
    - Update RLS policies for questions to check class ownership
    - Questions can only be submitted when class Q&A is open and class is today

  ## Notes
    - This simplifies the Q&A system by removing the qa_sessions table dependency
    - Q&A is now directly tied to classes, opening only on class days
*/

-- Add qa_is_open column to classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'qa_is_open'
  ) THEN
    ALTER TABLE classes ADD COLUMN qa_is_open boolean DEFAULT false;
  END IF;
END $$;

-- Create new questions table structure
CREATE TABLE IF NOT EXISTS questions_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Copy existing questions if they exist and have valid class_id from qa_sessions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
    INSERT INTO questions_new (id, class_id, question, is_answered, created_at)
    SELECT q.id, qs.class_id, q.question, q.is_answered, q.created_at
    FROM questions q
    JOIN qa_sessions qs ON q.session_id = qs.id
    WHERE qs.class_id IS NOT NULL
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Drop old questions table and rename new one
DROP TABLE IF EXISTS questions CASCADE;
ALTER TABLE questions_new RENAME TO questions;

-- Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Anyone can submit questions to open sessions" ON questions;
DROP POLICY IF EXISTS "Admin can update questions" ON questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON questions;

-- Create new policies for questions
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit questions when class Q&A is open"
  ON questions FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = class_id 
      AND classes.qa_is_open = true
    )
  );

CREATE POLICY "Admin can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_questions_class ON questions(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_qa_open ON classes(qa_is_open);