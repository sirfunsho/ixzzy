create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  product_slug text not null,
  colour text not null,
  size text not null,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug, colour, size)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;
revoke all on public.cart_items from anon, authenticated;
grant all on public.cart_items to service_role;

create or replace function public.replace_user_cart(p_user_id uuid, p_lines jsonb)
returns void
language plpgsql
set search_path = public
as $$
begin
  delete from public.cart_items where user_id = p_user_id;

  insert into public.cart_items (user_id, product_slug, colour, size, quantity)
  select p_user_id, line.product_slug, line.colour, line.size, line.quantity
  from jsonb_to_recordset(p_lines) as line(
    product_slug text,
    colour text,
    size text,
    quantity integer
  );
end;
$$;

create or replace function public.merge_user_cart(p_user_id uuid, p_lines jsonb)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.cart_items (user_id, product_slug, colour, size, quantity)
  select p_user_id, line.product_slug, line.colour, line.size, line.quantity
  from jsonb_to_recordset(p_lines) as line(
    product_slug text,
    colour text,
    size text,
    quantity integer
  )
  on conflict (user_id, product_slug, colour, size)
  do update set
    quantity = least(public.cart_items.quantity + excluded.quantity, 99),
    updated_at = now();
end;
$$;

revoke all on function public.replace_user_cart(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.merge_user_cart(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_user_cart(uuid, jsonb) to service_role;
grant execute on function public.merge_user_cart(uuid, jsonb) to service_role;

alter table public.orders alter column user_id drop not null;
