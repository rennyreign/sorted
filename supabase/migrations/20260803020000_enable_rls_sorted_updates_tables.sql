-- Close anon-key exposure on sorted_messages / sorted_changes.
--
-- Audit: both tables are used exclusively by the Sorted Updates Python
-- backend (operators/sorted-updates/implementation), which authenticates
-- with SUPABASE_SERVICE_ROLE_KEY. No frontend code, RPC, or anon-key
-- client ever reads or writes these tables — grep across app/, components/,
-- and lib/ found zero references.
--
-- service_role always bypasses RLS, so enabling RLS with no permissive
-- policies has no effect on the existing backend and fully closes the
-- anon/authenticated read+write exposure that existed before this migration.
--
-- Rollback:
--   ALTER TABLE public.sorted_messages DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.sorted_changes DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.sorted_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorted_changes ENABLE ROW LEVEL SECURITY;
