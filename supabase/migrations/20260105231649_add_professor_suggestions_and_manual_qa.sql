/*
  # Add Professor Suggestions and Manual Q&A Control

  ## Changes

  1. New Tables
    - `professor_suggestions`
      - `id` (uuid, primary key) - Unique identifier for each suggestion
      - `class_id` (uuid, foreign key) - Links to classes table
      - `name` (text) - Name of person suggesting
      - `topic` (text) - Suggested class topic
      - `votes` (integer) - Vote count for this suggestion
      - `created_at` (timestamptz) - When suggestion was created

  2. Modified Tables
    - `classes` - Add `qa_open` (boolean) field for manual Q&A control
      - Default to `true` for existing classes
      - Allows admin to manually close Q&A instead of auto-closing

  3. Security
    - Enable RLS on `professor_suggestions` table
    - Add policy for authenticated users to read all suggestions
    - Add policy for authenticated users to create suggestions
    - Add policy for authenticated users to vote (update votes)

  ## Notes
  - Users can suggest topics and vote on them
  - Admin controls Q&A opening/closing manually
  - Votes are tracked per suggestion to show popularity
*/

-- Add qa_open field to classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'qa_open'
  ) THEN
    ALTER TABLE classes ADD COLUMN qa_open boolean DEFAULT true;
  END IF;
END $$;

-- Create professor_suggestions table
CREATE TABLE IF NOT EXISTS professor_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  topic text NOT NULL,
  votes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on professor_suggestions
ALTER TABLE professor_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read suggestions
CREATE POLICY "Authenticated users can view professor suggestions"
  ON professor_suggestions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create suggestions
CREATE POLICY "Authenticated users can create professor suggestions"
  ON professor_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can vote (update votes)
CREATE POLICY "Authenticated users can vote on professor suggestions"
  ON professor_suggestions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_professor_suggestions_class_id ON professor_suggestions(class_id);
CREATE INDEX IF NOT EXISTS idx_professor_suggestions_votes ON professor_suggestions(votes DESC);