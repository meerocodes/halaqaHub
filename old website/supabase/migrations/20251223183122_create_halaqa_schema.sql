/*
  # Halaqa Website Schema

  ## Overview
  Complete database schema for a halaqa (Islamic study circle) management website with calendar, attendance, slides, and live Q&A features.

  ## New Tables

  ### 1. `classes`
  Stores information about scheduled halaqa classes
  - `id` (uuid, primary key)
  - `title` (text) - Name of the class/halaqa
  - `description` (text) - Detailed description
  - `location` (text) - Physical or virtual location
  - `class_date` (timestamptz) - Date and time of class
  - `duration_minutes` (integer) - Length of class
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `attendance`
  Tracks attendance for each class
  - `id` (uuid, primary key)
  - `class_id` (uuid, foreign key) - References classes table
  - `attendee_name` (text) - Name of person attending
  - `checked_in_at` (timestamptz) - When they signed in
  
  ### 3. `slides`
  Stores links to slides/documents for classes
  - `id` (uuid, primary key)
  - `class_id` (uuid, foreign key) - References classes table (nullable for general resources)
  - `title` (text) - Title of the resource
  - `url` (text) - Link to slides/document
  - `created_at` (timestamptz)
  
  ### 4. `qa_sessions`
  Manages live Q&A sessions
  - `id` (uuid, primary key)
  - `title` (text) - Session name
  - `is_open` (boolean) - Whether questions can be submitted
  - `class_id` (uuid, foreign key) - Optional link to specific class
  - `created_at` (timestamptz)
  - `closed_at` (timestamptz) - When session was closed
  
  ### 5. `questions`
  Stores anonymous questions for Q&A sessions
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key) - References qa_sessions
  - `question` (text) - The actual question
  - `is_answered` (boolean) - Status flag
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for classes, slides, and public Q&A viewing
  - Public write access for attendance and questions (anonymous users)
  - Admin-only write access for classes, slides, and Q&A session management
  - Admin users identified by custom claim in JWT

  ## Notes
  1. Admin authentication handled through Supabase Auth with app_metadata flag
  2. All timestamps use timestamptz for proper timezone handling
  3. Attendance and questions allow anonymous submissions
  4. Q&A sessions can be linked to specific classes or standalone
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  class_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  attendee_name text NOT NULL,
  checked_in_at timestamptz DEFAULT now()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create qa_sessions table
CREATE TABLE IF NOT EXISTS qa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  is_open boolean DEFAULT true,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES qa_sessions(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "Anyone can view classes"
  ON classes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Attendance policies
CREATE POLICY "Anyone can view attendance"
  ON attendance FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can add attendance"
  ON attendance FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Slides policies
CREATE POLICY "Anyone can view slides"
  ON slides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert slides"
  ON slides FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can update slides"
  ON slides FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can delete slides"
  ON slides FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Q&A Sessions policies
CREATE POLICY "Anyone can view qa sessions"
  ON qa_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert qa sessions"
  ON qa_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can update qa sessions"
  ON qa_sessions FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admin can delete qa sessions"
  ON qa_sessions FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Questions policies
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit questions to open sessions"
  ON questions FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qa_sessions 
      WHERE qa_sessions.id = session_id 
      AND qa_sessions.is_open = true
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_slides_class ON slides(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_qa_sessions_open ON qa_sessions(is_open);