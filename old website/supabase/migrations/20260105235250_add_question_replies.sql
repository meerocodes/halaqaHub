/*
  # Add Question Replies Table

  ## Changes

  1. New Tables
    - `question_replies`
      - `id` (uuid, primary key) - Unique identifier for each reply
      - `question_id` (uuid, foreign key) - Links to questions table
      - `reply` (text) - The reply content
      - `created_at` (timestamptz) - When reply was created

  2. Security
    - Enable RLS on `question_replies` table
    - Add policy for anyone to read replies
    - Add policy for anyone to create replies (anonymous)
    - Admin can delete replies via application logic

  ## Notes
  - Replies are anonymous like questions
  - Replies create threaded discussions under questions
  - Users can expand/collapse reply threads in the UI
*/

-- Create question_replies table
CREATE TABLE IF NOT EXISTS question_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  reply text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on question_replies
ALTER TABLE question_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read replies
CREATE POLICY "Anyone can view question replies"
  ON question_replies
  FOR SELECT
  USING (true);

-- Policy: Anyone can create replies (anonymous)
CREATE POLICY "Anyone can create question replies"
  ON question_replies
  FOR INSERT
  WITH CHECK (true);

-- Policy: Authenticated users (admins) can delete replies
CREATE POLICY "Authenticated users can delete question replies"
  ON question_replies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_question_replies_question_id ON question_replies(question_id);
CREATE INDEX IF NOT EXISTS idx_question_replies_created_at ON question_replies(created_at DESC);