create extension if not exists "pgcrypto";

create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null,
  hashtags text[] not null default '{}',
  suggested_schedule text not null,
  scheduled_at timestamptz not null,
  visual_prompt text not null,
  image_url text not null,
  status text not null default 'scheduled' check (status in ('draft', 'approved', 'scheduled', 'published', 'failed')),
  platforms text[] not null default '{instagram}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists meta_connections (
  id text primary key,
  facebook_page_id text,
  instagram_business_account_id text,
  access_token text not null,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_scheduled_posts_updated on scheduled_posts;
create trigger trg_scheduled_posts_updated
before update on scheduled_posts
for each row execute function set_updated_at();

drop trigger if exists trg_meta_connections_updated on meta_connections;
create trigger trg_meta_connections_updated
before update on meta_connections
for each row execute function set_updated_at();
