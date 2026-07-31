-- Add partner program column and update the new-affiliate trigger.

ALTER TABLE affiliates
ADD COLUMN IF NOT EXISTS program TEXT
  CHECK (program IN ('referral', 'factory'));

CREATE OR REPLACE FUNCTION handle_new_affiliate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO affiliates (id, email, display_name, phone, program)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'program'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
