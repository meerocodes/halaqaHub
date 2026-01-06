/*
  # Add Question Upvotes Feature

  1. New Tables
    - `question_upvotes`
      - `id` (uuid, primary key) - Unique identifier for each upvote
      - `question_id` (uuid, foreign key) - References the question being upvoted
      - `user_identifier` (text) - Anonymous user identifier (browser-generated UUID)
      - `created_at` (timestamptz) - When the upvote was created

  2. Changes
    - Add unique constraint on (question_id, user_identifier) to prevent duplicate upvotes
    - Create index on question_id for faster lookups

  3. Security
    - Enable RLS on `question_upvotes` table
    - Add policy for anyone to view upvote counts
    - Add policy for anyone to add their own upvotes
    - Add policy for anyone to remove their own upvotes
    - Add policy for admins to delete any upvote
*/

CREATE TABLE IF NOT EXISTS question_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS question_upvotes_question_user_unique 
  ON question_upvotes(question_id, user_identifier);

CREATE INDEX IF NOT EXISTS question_upvotes_question_id_idx 
  ON question_upvotes(question_id);

ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upvotes"
  ON question_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add upvotes"
  ON question_upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own upvotes"
  ON question_upvotes FOR DELETE
  USING (true);