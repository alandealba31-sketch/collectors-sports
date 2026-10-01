-- Collectors Sports cloud schema
-- Prepared for Supabase/PostgreSQL. This migration is safe to keep in the public repo:
-- it contains no credentials and all personal inventory tables are protected by RLS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_currency text not null default 'MXN' check (preferred_currency in ('MXN','USD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_collections (
  id text primary key,
  sport text not null,
  manufacturer text not null,
  season text,
  name text not null,
  short_name text,
  source_url text,
  checklist_url text,
  coverage text not null default 'collection',
  base_count integer,
  image_url text,
  image_source_url text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_cards (
  id uuid primary key default gen_random_uuid(),
  collection_id text not null references public.catalog_collections(id) on delete cascade,
  card_number text not null,
  player text not null,
  team text,
  subset text not null default 'Base',
  rookie boolean not null default false,
  autograph boolean not null default false,
  relic boolean not null default false,
  image_front_url text,
  image_back_url text,
  image_kind text check (image_kind is null or image_kind in ('exact','reference','collection')),
  image_source text,
  image_source_url text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(collection_id, card_number, subset, player)
);

create index if not exists catalog_cards_collection_idx on public.catalog_cards(collection_id);
create index if not exists catalog_cards_player_idx on public.catalog_cards(lower(player));
create index if not exists catalog_cards_number_idx on public.catalog_cards(collection_id, card_number);

create table if not exists public.inventory_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_card_id uuid references public.catalog_cards(id) on delete set null,
  catalog_collection_id text references public.catalog_collections(id) on delete set null,
  sport text not null,
  player text not null,
  team text,
  season text,
  manufacturer text,
  product text,
  card_number text,
  parallel text,
  serial text,
  rookie boolean not null default false,
  autograph boolean not null default false,
  relic boolean not null default false,
  insert_card boolean not null default false,
  sp boolean not null default false,
  ssp boolean not null default false,
  currency text not null default 'MXN' check (currency in ('MXN','USD')),
  purchase_price numeric(14,2) not null default 0,
  current_value numeric(14,2) not null default 0,
  condition text,
  protection text,
  location text,
  notes text,
  reference_image_url text,
  reference_image_kind text check (reference_image_kind is null or reference_image_kind in ('exact','reference','collection')),
  reference_image_source text,
  reference_image_source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_cards_user_idx on public.inventory_cards(user_id, created_at desc);
create index if not exists inventory_cards_user_sport_idx on public.inventory_cards(user_id, sport);
create index if not exists inventory_cards_user_collection_idx on public.inventory_cards(user_id, catalog_collection_id);

create table if not exists public.inventory_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inventory_card_id uuid not null references public.inventory_cards(id) on delete cascade,
  side text not null check (side in ('front','back')),
  storage_path text not null,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  unique(inventory_card_id, side)
);

create table if not exists public.price_snapshots (
  id bigint generated always as identity primary key,
  catalog_card_id uuid references public.catalog_cards(id) on delete cascade,
  inventory_card_id uuid references public.inventory_cards(id) on delete cascade,
  currency text not null check (currency in ('MXN','USD')),
  value numeric(14,2) not null,
  source text not null,
  source_url text,
  sale_type text,
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  check (catalog_card_id is not null or inventory_card_id is not null)
);

create index if not exists price_snapshots_catalog_idx on public.price_snapshots(catalog_card_id, observed_at desc);
create index if not exists price_snapshots_inventory_idx on public.price_snapshots(inventory_card_id, observed_at desc);

alter table public.profiles enable row level security;
alter table public.inventory_cards enable row level security;
alter table public.inventory_images enable row level security;
alter table public.catalog_collections enable row level security;
alter table public.catalog_cards enable row level security;
alter table public.price_snapshots enable row level security;

-- Catalog data is readable by anyone using the app. Only trusted server-side jobs should write it.
drop policy if exists "Catalog collections are publicly readable" on public.catalog_collections;
create policy "Catalog collections are publicly readable"
  on public.catalog_collections for select
  using (true);

drop policy if exists "Catalog cards are publicly readable" on public.catalog_cards;
create policy "Catalog cards are publicly readable"
  on public.catalog_cards for select
  using (true);

-- A signed-in user can only see and mutate their own profile/inventory.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users read own inventory" on public.inventory_cards;
create policy "Users read own inventory" on public.inventory_cards for select using (auth.uid() = user_id);
drop policy if exists "Users insert own inventory" on public.inventory_cards;
create policy "Users insert own inventory" on public.inventory_cards for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own inventory" on public.inventory_cards;
create policy "Users update own inventory" on public.inventory_cards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own inventory" on public.inventory_cards;
create policy "Users delete own inventory" on public.inventory_cards for delete using (auth.uid() = user_id);

drop policy if exists "Users read own images" on public.inventory_images;
create policy "Users read own images" on public.inventory_images for select using (auth.uid() = user_id);
drop policy if exists "Users insert own images" on public.inventory_images;
create policy "Users insert own images" on public.inventory_images for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own images" on public.inventory_images;
create policy "Users update own images" on public.inventory_images for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own images" on public.inventory_images;
create policy "Users delete own images" on public.inventory_images for delete using (auth.uid() = user_id);

-- Price snapshots attached to the public catalog can be read by the app; private inventory snapshots remain private.
drop policy if exists "Catalog price snapshots are readable" on public.price_snapshots;
create policy "Catalog price snapshots are readable" on public.price_snapshots for select
  using (
    catalog_card_id is not null
    or exists (
      select 1 from public.inventory_cards i
      where i.id = inventory_card_id and i.user_id = auth.uid()
    )
  );

-- Private storage bucket for user photographs. The object name convention is:
-- {user_id}/{inventory_card_id}/front.jpg and .../back.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inventory-images','inventory-images',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users read own inventory image objects" on storage.objects;
create policy "Users read own inventory image objects"
  on storage.objects for select
  using (bucket_id = 'inventory-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users upload own inventory image objects" on storage.objects;
create policy "Users upload own inventory image objects"
  on storage.objects for insert
  with check (bucket_id = 'inventory-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users update own inventory image objects" on storage.objects;
create policy "Users update own inventory image objects"
  on storage.objects for update
  using (bucket_id = 'inventory-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'inventory-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own inventory image objects" on storage.objects;
create policy "Users delete own inventory image objects"
  on storage.objects for delete
  using (bucket_id = 'inventory-images' and (storage.foldername(name))[1] = auth.uid()::text);
