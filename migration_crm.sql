-- CRM Pipeline Migration
-- Adds review system and CRM status tracking to the prospects table

-- CRM pipeline status
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS crm_status TEXT NOT NULL DEFAULT 'new'
    CHECK (crm_status IN ('new','outreached','responded','mockup_revealed','build','quote','paid','lost','na'));

-- Unique slug for the public review URL: sortmydigital.com/review/[slug]
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS review_slug TEXT UNIQUE;

-- Mockup image URL — set when mockup is uploaded, enables blurred reveal on review page
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS mockup_url TEXT;

-- CRM timestamps
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS mockup_revealed_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prospects_crm_status ON prospects (crm_status);
CREATE INDEX IF NOT EXISTS idx_prospects_review_slug ON prospects (review_slug);

-- Auto-generate review_slug from name for existing rows
UPDATE prospects
  SET review_slug = LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  )
  WHERE review_slug IS NULL AND name IS NOT NULL;

-- Handle slug collisions by appending place_id suffix
UPDATE prospects p1
  SET review_slug = p1.review_slug || '-' || SUBSTRING(p1.place_id, 1, 6)
  WHERE EXISTS (
    SELECT 1 FROM prospects p2
    WHERE p2.review_slug = p1.review_slug
    AND p2.place_id != p1.place_id
    AND p2.place_id < p1.place_id
  );

-- Trigger: auto-set review_slug on insert
CREATE OR REPLACE FUNCTION set_review_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_slug IS NULL AND NEW.name IS NOT NULL THEN
    NEW.review_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_review_slug ON prospects;
CREATE TRIGGER trigger_set_review_slug
  BEFORE INSERT ON prospects
  FOR EACH ROW EXECUTE FUNCTION set_review_slug();

-- Trigger: auto-update status_updated_at on crm_status change
CREATE OR REPLACE FUNCTION update_crm_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.crm_status IS DISTINCT FROM NEW.crm_status THEN
    NEW.status_updated_at := NOW();
    -- Auto-set contacted_at on first outreach
    IF NEW.crm_status = 'outreached' AND OLD.crm_status = 'new' THEN
      NEW.contacted_at := NOW();
    END IF;
    -- Auto-set mockup_revealed_at
    IF NEW.crm_status = 'mockup_revealed' THEN
      NEW.mockup_revealed_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_crm_status_timestamp ON prospects;
CREATE TRIGGER trigger_crm_status_timestamp
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_crm_status_timestamp();
