-- =========================================================
-- JECA PrepHub - Supabase Database Schema
-- Run this query once in your Supabase Dashboard:
-- Go to: SQL Editor -> New query -> Paste and click Run
-- =========================================================

-- 1. Create table to store user progress
create table if not exists public.user_progress (
  user_id uuid references auth.users(id) on delete cascade primary key,
  completed_topics text[] default array[]::text[],
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- 3. Policy: Students can view only their own progress
create policy "Users can view their own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- 4. Policy: Students can update and insert their own progress
create policy "Users can update their own progress"
  on public.user_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
