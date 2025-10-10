-- Add essential column to shopping_items table
ALTER TABLE shopping_items 
ADD COLUMN IF NOT EXISTS essential BOOLEAN DEFAULT false;

