/*
  # Enhance gift lists functionality
  
  1. Changes
    - Add cover_image and icon columns to gift_lists table
    - Add person_id column for optional person association
    - Update shared_lists table if needed
*/

-- Add new columns to gift_lists if they don't exist
DO $$ 
BEGIN
  -- Add cover_image column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_lists' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE gift_lists ADD COLUMN cover_image text;
  END IF;

  -- Add icon column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_lists' AND column_name = 'icon'
  ) THEN
    ALTER TABLE gift_lists ADD COLUMN icon text;
  END IF;

  -- Add person_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_lists' AND column_name = 'person_id'
  ) THEN
    ALTER TABLE gift_lists ADD COLUMN person_id uuid REFERENCES people(id) ON DELETE SET NULL;
  END IF;
END $$;