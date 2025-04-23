/*
  # Add shared gifts functionality
  
  1. New Tables
    - `shared_gifts`
      - `id` (uuid, primary key)
      - `gift_id` (uuid, references saved_gifts)
      - `share_token` (text, unique)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Security
    - Enable RLS on shared_gifts table
    - Add policies for:
      - Public read access to shared gifts
      - Authenticated users can create shares for their gifts
*/

CREATE TABLE shared_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id uuid REFERENCES saved_gifts(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Enable RLS
ALTER TABLE shared_gifts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to shared gifts
CREATE POLICY "Anyone can read shared gifts"
  ON shared_gifts
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create shares for their gifts
CREATE POLICY "Users can share own gifts"
  ON shared_gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM saved_gifts
      WHERE id = gift_id
      AND user_id = auth.uid()
    )
  );

-- Create function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS text AS $$
DECLARE
  token text;
  unique_token boolean;
BEGIN
  LOOP
    -- Generate a random token (8 characters)
    token := encode(gen_random_bytes(6), 'hex');
    
    -- Check if token is unique
    SELECT NOT EXISTS (
      SELECT 1 FROM shared_gifts WHERE share_token = token
    ) INTO unique_token;
    
    EXIT WHEN unique_token;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;