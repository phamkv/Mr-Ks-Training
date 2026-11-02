create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  owner_hash bytea unique not null,
  view_hash bytea unique not null,
  settings jsonb not null default '{}',
  game_state jsonb not null default '{}',
  settings_updated_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists results (
  profile_id uuid not null references profiles(id) on delete cascade,
  id uuid not null,
  game_id text not null,
  started_at timestamptz not null,
  local_date date not null,
  duration_ms integer not null,
  score real not null,
  stage smallint not null,
  trials integer not null,
  correct integer not null,
  meta jsonb not null default '{}',
  language text not null,
  app_version text not null,
  primary key (profile_id, id)
);
create index if not exists results_profile_time on results (profile_id, started_at);
