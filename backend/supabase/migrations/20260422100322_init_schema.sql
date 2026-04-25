-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
-- Profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2.TABLES
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

--Tasks
create table public.tasks (
id uuid primary key default gen_random_uuid(),
owner_id uuid references public.profiles(id) on delete cascade not null,
project_id uuid references public.projects(id) on delete set null,
parent_task_id uuid references public.tasks(id) on delete cascade,
title text not null,
description text,
status text check (status in ('todo', 'in_progress', 'done')) default 'todo',
priority text  check (priority in ('low', 'medium', 'high')) default 'medium',
due_date timestamptz,
created_at timestamptz default now(),
updated_at timestamptz default now()
);

-- Tags_tags
create table public.task_tags (
  task_id uuid references public.tasks(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- 3.FUNCTIONS
-- Functions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
new.updated_at = now();
return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, username)
values (new.id, new.email);
return new;
end;
$$ language plpgsql security definer;

--Triggers
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger on_task_updated
before update on public.tasks
for each row execute procedure public.handle_updated_at();

-- 4.RLS
-- (1a linea para activar y siguientes crear politicas)

--(profiles)
alter table public.profiles enable row level security;

create policy "Users can view own profiles"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profiles"
on public.profiles for update
using (auth.uid() = id);

--(projects)
alter table public.projects enable row level security;

create policy "Users can view own projects"
on public.projects for select
using (auth.uid() = owner_id);

create policy "Users can create own projects"
on public.projects for insert
with check (auth.uid() = owner_id);

create policy "Users can update own projects"
on public.projects for update
using (auth.uid() = owner_id);

create policy "Users can delete own projects"
on public.projects for delete
using (auth.uid() = owner_id);

-- (tags)
alter table public.tags enable row level security;

create policy "Users can view own tags"
on public.tags for select
using (auth.uid() = owner_id);

create policy "Users can create own tags"
on public.tags for insert
with check (auth.uid() = owner_id);

create policy "Users can update own tags"
on public.tags for update
using (auth.uid() = owner_id);

create policy "Users can delete own tags"
on public.tags for delete
using (auth.uid() = owner_id);

-- (tasks)
alter table public.tasks enable row level security;

create policy "Users can view own tasks"
on public.tasks for select
using (auth.uid() = owner_id);

create policy "Users can create own tasks"
on public.tasks for insert
with check (auth.uid() = owner_id);

create policy "Users can update own tasks"
on public.tasks for update
using (auth.uid() = owner_id);

create policy "Users can delete own tasks"
on public.tasks for delete
using (auth.uid() = owner_id);

-- (task_tags)
alter table public.task_tags enable row level security;

create policy "Users can view own task_tags"
on public.task_tags for select
using (exists (
  select 1 from public.tasks
  where id = task_id and owner_id = auth.uid()
));

create policy "Users can create own task_tags"
on public.task_tags for insert
with check (exists (
  select 1 from public.tasks
  where id = task_id and owner_id = auth.uid()
));

create policy "Users can delete own task_tags"
on public.task_tags for delete
using (exists (
  select 1 from public.tasks
  where id = task_id and owner_id = auth.uid()
));