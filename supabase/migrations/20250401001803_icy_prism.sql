/*
  # Add updated_at column to gift_lists table

  1. Changes
    - Add updated_at column to gift_lists table
    - Set default value to now()
    - Create trigger to automatically update timestamp
*/

-- Add updated_at column if it doesn't exist
ALTER TABLE gift_lists 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the timestamp
DROP TRIGGER IF EXISTS update_gift_lists_updated_at ON gift_lists;
CREATE TRIGGER update_gift_lists_updated_at
    BEFORE UPDATE ON gift_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();