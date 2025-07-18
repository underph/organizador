-- Add links field to items table for purchase and comparison links
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS purchase_links TEXT[];