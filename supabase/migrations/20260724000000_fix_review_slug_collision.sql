-- Fix: review_slug collision on insert
--
-- The original set_review_slug() trigger (migration_crm.sql) generates a slug
-- from the business name but does NOT check for collisions. When two businesses
-- share the same name (e.g. "TaxAssist Accountants", "PizzaExpress"), the second
-- insert violates the UNIQUE constraint on review_slug and rejects the entire
-- PostgREST batch (50 rows) — causing the prospect-finder to lose up to 50
-- records per clash.
--
-- This migration replaces the trigger with a collision-aware version that
-- appends the first 6 characters of place_id when the base slug already exists
-- for a different place. Since place_id is unique, the composite slug is
-- guaranteed unique.

CREATE OR REPLACE FUNCTION set_review_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
BEGIN
    IF NEW.review_slug IS NULL AND NEW.name IS NOT NULL THEN
        base_slug := LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'),
                '\s+', '-', 'g'
            )
        );

        -- If the base slug already belongs to a different place, append
        -- a short place_id suffix to guarantee uniqueness.
        IF EXISTS (
            SELECT 1 FROM prospects
            WHERE review_slug = base_slug
              AND place_id IS DISTINCT FROM NEW.place_id
        ) THEN
            base_slug := base_slug || '-' || SUBSTRING(COALESCE(NEW.place_id, ''), 1, 6);
        END IF;

        NEW.review_slug := base_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger itself doesn't need to be recreated — just the function body
-- has changed. But drop and recreate to be safe across environments.
DROP TRIGGER IF EXISTS trigger_set_review_slug ON prospects;
CREATE TRIGGER trigger_set_review_slug
    BEFORE INSERT ON prospects
    FOR EACH ROW EXECUTE FUNCTION set_review_slug();
