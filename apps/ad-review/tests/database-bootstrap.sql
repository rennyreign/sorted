-- Disposable local/CI database only. Supabase already provides these in production.
create role anon;
create role authenticated;
create role service_role;
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
