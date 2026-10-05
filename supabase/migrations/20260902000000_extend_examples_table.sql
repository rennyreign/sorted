-- Extend examples table for the example-uploader operator
-- Adds blurb, slug, and 'build' type support

-- Add 'build' to the type check constraint
ALTER TABLE examples DROP CONSTRAINT IF EXISTS examples_type_check;
ALTER TABLE examples ADD CONSTRAINT examples_type_check
  CHECK (type IN ('mockup', 'live', 'build'));

-- Add blurb column for AI-generated descriptions
ALTER TABLE examples ADD COLUMN IF NOT EXISTS blurb text;

-- Add slug column for linking gallery entries to case studies
ALTER TABLE examples ADD COLUMN IF NOT EXISTS slug text;

-- Add is_claimed column to distinguish live clients from unclaimed builds
ALTER TABLE examples ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT true;

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS examples_slug_idx ON examples(slug) WHERE slug IS NOT NULL;
