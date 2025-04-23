/*
  # Add people management feature

  1. Changes
    - Drop existing tables if they exist
    - Create people and important_dates tables
    - Set up RLS policies for both tables
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS important_dates CASCADE;
DROP TABLE IF EXISTS people CASCADE;

-- Create people table
CREATE TABLE people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  relationship text NOT NULL,
  interests text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create important_dates table
CREATE TABLE important_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid REFERENCES people(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('birthday', 'anniversary', 'other')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;

-- Policies for people table
CREATE POLICY "Users can read own people"
  ON people
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create people"
  ON people
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own people"
  ON people
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own people"
  ON people
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for important_dates table
CREATE POLICY "Users can read own dates"
  ON important_dates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM people
      WHERE id = person_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create dates"
  ON important_dates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM people
      WHERE id = person_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own dates"
  ON important_dates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM people
      WHERE id = person_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM people
      WHERE id = person_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own dates"
  ON important_dates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM people
      WHERE id = person_id
      AND user_id = auth.uid()
    )
  );