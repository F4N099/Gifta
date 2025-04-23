-- Add language column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'it';

-- Update existing rows to use default language
UPDATE profiles 
SET language = 'it' 
WHERE language IS NULL;