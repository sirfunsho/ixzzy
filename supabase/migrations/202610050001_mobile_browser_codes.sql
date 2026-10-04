-- Browser-based mobile login pickup codes for Option B.
-- Flow: website login creates a short-lived one-time code,
-- the app swaps it for a 30-day mobile_sessions token via POST.
-- We store only the SHA-256 hash, never the raw code.
create table if not exists public.mobile_auth_codes (
  code_hash text primary key check (code_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references public.app_users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mobile_auth_codes_user_id_idx on public.mobile_auth_codes (user_id);
create index if not exists mobile_auth_codes_expires_at_idx on public.mobile_auth_codes (expires_at);

alter table public.mobile_auth_codes enable row level security;
revoke all on public.mobile_auth_codes from anon, authenticated;
grant all on public.mobile_auth_codes to service_role;
