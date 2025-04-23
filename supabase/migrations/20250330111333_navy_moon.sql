/*
  # Add saved gifts functionality

  1. New Tables
    - `saved_gifts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `emoji` (text)
      - `price` (numeric)
      - `description` (text)
      - `topics` (text[])
      - `buy_link` (text)
      - `source` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on saved_gifts table
    - Add policies for authenticated users to:
      - Read their own saved gifts
      - Create new saved gifts
      - Delete their own saved gifts
*/

CREATE TABLE saved_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  emoji text NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  topics text[] NOT NULL,
  buy_link text NOT NULL,
  source text NOT NULL CHECK (source IN ('Amazon', 'Etsy')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, buy_link)
);

-- Enable RLS
ALTER TABLE saved_gifts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own saved gifts"
  ON saved_gifts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved gifts"
  ON saved_gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved gifts"
  ON saved_gifts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);