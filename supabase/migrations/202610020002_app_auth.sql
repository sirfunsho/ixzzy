create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text,
  google_sub text unique,
  email_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_tokens (
  token_hash text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  purpose text not null check (purpose in ('verify-email', 'reset-password')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;
revoke all on public.app_users from anon, authenticated;
grant all on public.app_users to service_role;
alter table public.auth_tokens enable row level security;
revoke all on public.auth_tokens from anon, authenticated;
grant all on public.auth_tokens to service_role;

-- Keep existing Supabase user IDs so historical orders remain associated when
-- their owner signs in with a Google account using the same verified email.
insert into public.app_users (id, email, name, email_verified_at)
select id, lower(email), coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email), email_confirmed_at
from auth.users
where email is not null
on conflict (id) do nothing;

alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders add constraint orders_user_id_fkey
  foreign key (user_id) references public.app_users(id) on delete restrict;

drop policy if exists "Customers can read their own orders" on public.orders;
drop policy if exists "Customers can create their own orders" on public.orders;
revoke all on public.orders from anon, authenticated;
grant all on public.orders to service_role;
