create table if not exists public.mobile_sessions (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references public.app_users(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mobile_sessions_user_id_idx on public.mobile_sessions (user_id);
create index if not exists mobile_sessions_expires_at_idx on public.mobile_sessions (expires_at);

alter table public.mobile_sessions enable row level security;
revoke all on public.mobile_sessions from anon, authenticated;
grant all on public.mobile_sessions to service_role;
