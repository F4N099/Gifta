-- Drop existing table if exists
DROP TABLE IF EXISTS shared_gifts CASCADE;

-- Create shared_gifts table
CREATE TABLE shared_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id uuid REFERENCES saved_gifts(id) ON DELETE CASCADE,
  share_token text NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT unique_share_token UNIQUE (share_token)
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