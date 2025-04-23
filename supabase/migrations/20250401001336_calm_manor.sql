/*
  # Enhance gift lists functionality
  
  1. Changes
    - Add cover_image and icon columns to gift_lists table
    - Add person_id column for optional person association
    - Add shared_lists table for list sharing
    - Add RLS policies for new functionality
*/

-- Add new columns to gift_lists
ALTER TABLE gift_lists 
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES people(id) ON DELETE SET NULL;

-- Create shared_lists table
CREATE TABLE shared_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES gift_lists(id) ON DELETE CASCADE,
  share_token text NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT unique_list_share_token UNIQUE (share_token)
);

-- Enable RLS on shared_lists
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Add policies for shared_lists
CREATE POLICY "Anyone can read shared lists"
  ON shared_lists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can share own lists"
  ON shared_lists
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