/*
  # Fix RLS policy for saved gifts table
  
  1. Changes
    - Add user_id to saved_gifts insert policy
    - Ensure user_id is set correctly when sharing gifts
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create saved gifts" ON saved_gifts;
DROP POLICY IF EXISTS "Users can read own saved gifts" ON saved_gifts;
DROP POLICY IF EXISTS "Users can delete own saved gifts" ON saved_gifts;

-- Recreate policies with correct user_id handling
CREATE POLICY "Users can create saved gifts"
  ON saved_gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

CREATE POLICY "Users can read own saved gifts"
  ON saved_gifts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved gifts"
  ON saved_gifts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);