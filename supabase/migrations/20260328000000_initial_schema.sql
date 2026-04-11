-- moderators
create table moderators (
  id             uuid primary key default gen_random_uuid(),
  did            text not null unique,
  handle         text not null,
  display_name   text not null,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- field_memberships
create table field_memberships (
  id           uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references moderators(id),
  field_id     text not null,
  joined_at    timestamptz not null default now(),
  unique (moderator_id, field_id)
);

-- classifications
create table classifications (
  id         uuid primary key default gen_random_uuid(),
  field_id   text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- requests
create table requests (
  id              uuid primary key default gen_random_uuid(),
  twitter_handle  text not null unique,
  display_name    text not null,
  submitted_by    uuid references moderators(id),
  entry_id        uuid,
  created_at      timestamptz not null default now()
);

-- entries
create table entries (
  id                uuid primary key default gen_random_uuid(),
  bluesky_did       text not null unique,
  bluesky_handle    text not null,
  twitter_handle    text,
  display_name      text not null,
  transition_status text not null,
  status            text not null check (status in ('pending', 'published', 'rejected')),
  submitted_by      uuid references moderators(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- requests.entry_id → entries の循環参照を後から追加
alter table requests
  add constraint requests_entry_id_fkey
  foreign key (entry_id) references entries(id);

-- entry_fields
create table entry_fields (
  id                uuid primary key default gen_random_uuid(),
  entry_id          uuid not null references entries(id),
  field_id          text not null,
  classification_id uuid references classifications(id),
  unique (entry_id, field_id)
);

-- evidences
create table evidences (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references entries(id),
  moderator_id uuid references moderators(id),
  content      text not null,
  created_at   timestamptz not null default now()
);

-- activities
create table activities (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references entries(id),
  moderator_id uuid references moderators(id),
  action       text not null check (action in ('migrate', 'submit', 'approve', 'reject', 'edit')),
  payload      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);