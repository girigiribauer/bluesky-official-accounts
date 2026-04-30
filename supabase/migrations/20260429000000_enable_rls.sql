-- Enable Row Level Security on all tables.
-- Server-side code uses the service role key which bypasses RLS.
-- No anon access is needed; policies will be added when going live.

alter table moderators      enable row level security;
alter table field_memberships enable row level security;
alter table classifications  enable row level security;
alter table accounts         enable row level security;
alter table requests         enable row level security;
alter table entries          enable row level security;
alter table account_fields   enable row level security;
alter table evidences        enable row level security;
alter table activities       enable row level security;
alter table news             enable row level security;
alter table oauth_states     enable row level security;
alter table oauth_sessions   enable row level security;
alter table old_categories   enable row level security;
