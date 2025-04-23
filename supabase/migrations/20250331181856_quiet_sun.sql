/*
  # Add gift lists functionality

  1. New Tables
    - `gift_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, max 50 chars)
      - `created_at` (timestamp)

    - `list_gifts`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references gift_lists)
      - `gift_id` (uuid, references saved_gifts)
      - `saved_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own lists and gifts
      - Create new lists (max 10 per user)
      - Update their own lists
      - Delete their own lists
*/

-- Create gift_lists table
CREATE TABLE gift_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) <= 50),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_list_name_per_user UNIQUE (user_id, name)
);

-- Create list_gifts table
CREATE TABLE list_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES gift_lists(id) ON DELETE CASCADE,
  gift_id uuid REFERENCES saved_gifts(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  CONSTRAINT unique_gift_per_list UNIQUE (list_id, gift_id)
);

-- Enable RLS
ALTER TABLE gift_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_gifts ENABLE ROW LEVEL SECURITY;

-- Policies for gift_lists
CREATE POLICY "Users can read own lists"
  ON gift_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create lists if under limit"
  ON gift_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT COUNT(*)
      FROM gift_lists
      WHERE user_id = auth.uid()
    ) < 10
  );

CREATE POLICY "Users can update own lists"
  ON gift_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON gift_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for list_gifts
CREATE POLICY "Users can read own list gifts"
  ON list_gifts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM gift_lists
      WHERE id = list_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add gifts to own lists"
  ON list_gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM gift_lists
      WHERE id = list_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove gifts from own lists"
  ON list_gifts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM gift_lists
      WHERE id = list_id
      AND user_id = auth.uid()
    )
  );