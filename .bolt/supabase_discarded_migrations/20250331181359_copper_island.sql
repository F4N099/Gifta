/*
  # Add saved gifts functionality if not exists

  1. Changes
    - Create saved_gifts table if it doesn't exist
    - Add RLS policies if they don't exist
    - Ensure unique constraint on user_id + buy_link
*/

-- Check if table exists and create if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_gifts'
  ) THEN
    -- Create the table
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

    -- Create policies
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
  END IF;
END $$;