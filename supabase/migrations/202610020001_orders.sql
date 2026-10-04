create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_note text,
  items jsonb not null,
  subtotal_ngn integer not null check (subtotal_ngn > 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

grant select, insert on public.orders to authenticated;

create policy "Customers can read their own orders"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Customers can create their own orders"
  on public.orders for insert to authenticated
  with check ((select auth.uid()) = user_id);
