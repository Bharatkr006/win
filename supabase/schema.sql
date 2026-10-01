-- ============================================================
-- Winter Arc — Supabase schema
-- Run this in the Supabase SQL Editor (or via migrations).
-- ============================================================

-- ── habits ───────────────────────────────────────────────────
create table habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  position   int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table habits enable row level security;

create policy "Users can read own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habits"
  on habits for delete
  using (auth.uid() = user_id);

create index idx_habits_user on habits (user_id);

-- ── habit_logs ───────────────────────────────────────────────
create table habit_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  habit_id  uuid not null references habits(id)     on delete cascade,
  date      date not null,

  unique (habit_id, date)
);

alter table habit_logs enable row level security;

create policy "Users can read own habit_logs"
  on habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own habit_logs"
  on habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habit_logs"
  on habit_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habit_logs"
  on habit_logs for delete
  using (auth.uid() = user_id);

create index idx_habit_logs_user on habit_logs (user_id, date);

-- ── tasks ────────────────────────────────────────────────────
create table tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  title      text not null,
  is_done    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Users can read own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

create index idx_tasks_user_date on tasks (user_id, date);

-- ── journal ──────────────────────────────────────────────────
create table journal (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  note       text not null default '',
  created_at timestamptz not null default now(),

  unique (user_id, date)
);

alter table journal enable row level security;

create policy "Users can read own journal"
  on journal for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal"
  on journal for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal"
  on journal for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own journal"
  on journal for delete
  using (auth.uid() = user_id);

create index idx_journal_user_date on journal (user_id, date);
