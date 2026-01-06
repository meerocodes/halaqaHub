/*
  # Add Subtitle Field to Classes

  ## Changes

  1. Modified Tables
    - `classes` - Add `subtitle` (text) field
      - Optional field for additional context about the class
      - Displayed in class details and calendar views

  ## Notes
  - Subtitle provides a brief description or tagline for classes
  - Helps users quickly understand class topics
*/

-- Add subtitle field to classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE classes ADD COLUMN subtitle text;
  END IF;
END $$;