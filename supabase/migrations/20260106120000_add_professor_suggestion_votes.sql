/*
  # Track professor suggestion votes per user

  ## Changes
  - Create `professor_suggestion_votes` table to enforce one vote per user per suggestion
  - Add RLS policies for authenticated users
  - Add triggers to keep `professor_suggestions.votes` in sync
*/

CREATE TABLE IF NOT EXISTS professor_suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES professor_suggestions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_professor_vote UNIQUE (suggestion_id, user_id)
);

ALTER TABLE professor_suggestion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suggestion votes"
  ON professor_suggestion_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can vote once per suggestion"
  ON professor_suggestion_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_prof_suggestion_votes()
RETURNS trigger AS $$
BEGIN
  UPDATE professor_suggestions
  SET votes = votes + 1
  WHERE id = NEW.suggestion_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_prof_suggestion_votes()
RETURNS trigger AS $$
BEGIN
  UPDATE professor_suggestions
  SET votes = GREATEST(0, votes - 1)
  WHERE id = OLD.suggestion_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS professor_suggestion_votes_insert ON professor_suggestion_votes;
CREATE TRIGGER professor_suggestion_votes_insert
  AFTER INSERT ON professor_suggestion_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_prof_suggestion_votes();

DROP TRIGGER IF EXISTS professor_suggestion_votes_delete ON professor_suggestion_votes;
CREATE TRIGGER professor_suggestion_votes_delete
  AFTER DELETE ON professor_suggestion_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_prof_suggestion_votes();
