

-- Profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- Tags
create table public.tags (
id uuid primary key default gen_random_uuid(),
owner_id uuid references public.profiles(id) on delete cascade not null,
name text not null,
color text default '#94a3b8',
created_at timestamptz default now()
);