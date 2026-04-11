-- OAuth フロー中の一時状態（CSRF防止）
create table oauth_states (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now()
);

-- トークン保管（DIDキー）
create table oauth_sessions (
  did text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
