
-- Add quantity column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
