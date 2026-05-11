-- Math Master 5U schema
create extension if not exists pgcrypto;

create or replace function public.normalize_answer(raw_answer text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(trim(coalesce(raw_answer, ''))), '\s+', '', 'g');
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  display_name text not null,
  total_points integer not null default 0 check (total_points >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_solved_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.riddles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_markdown text not null,
  image_path text,
  correct_answer_normalized text not null,
  release_date date not null unique,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.riddle_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  riddle_id uuid not null references public.riddles (id) on delete cascade,
  submitted_answer text not null,
  normalized_answer text not null,
  is_correct boolean not null,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_riddles_release_date on public.riddles (release_date desc);
create index if not exists idx_submissions_user_riddle on public.riddle_submissions (user_id, riddle_id);
create unique index if not exists uniq_correct_submission_per_user_riddle
  on public.riddle_submissions (user_id, riddle_id)
  where is_correct = true;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch_updated_at on public.profiles;
create trigger trg_profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

create or replace function public.ensure_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.ensure_profile_for_new_user();

create or replace function public.normalize_riddle_answer()
returns trigger
language plpgsql
as $$
begin
  new.correct_answer_normalized = public.normalize_answer(new.correct_answer_normalized);
  return new;
end;
$$;

drop trigger if exists trg_normalize_riddle_answer on public.riddles;
create trigger trg_normalize_riddle_answer
before insert or update on public.riddles
for each row execute function public.normalize_riddle_answer();

alter table public.profiles enable row level security;
alter table public.riddles enable row level security;
alter table public.riddle_submissions enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "riddles_select_released" on public.riddles;
create policy "riddles_select_released"
  on public.riddles
  for select
  to authenticated
  using (release_date <= current_date);

drop policy if exists "submissions_insert_own" on public.riddle_submissions;
create policy "submissions_insert_own"
  on public.riddle_submissions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "submissions_select_own" on public.riddle_submissions;
create policy "submissions_select_own"
  on public.riddle_submissions
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.submit_riddle_answer(p_riddle_id uuid, p_answer text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_normalized_answer text := public.normalize_answer(p_answer);
  v_expected_answer text;
  v_is_correct boolean;
  v_already_solved boolean;
  v_current_streak integer := 0;
begin
  if v_user_id is null then
    return jsonb_build_object('status', 'unauthorized');
  end if;

  select r.correct_answer_normalized
  into v_expected_answer
  from public.riddles r
  where r.id = p_riddle_id
    and r.release_date <= current_date;

  if v_expected_answer is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  select exists (
    select 1
    from public.riddle_submissions s
    where s.user_id = v_user_id
      and s.riddle_id = p_riddle_id
      and s.is_correct = true
  ) into v_already_solved;

  if v_already_solved then
    return jsonb_build_object('status', 'already_solved');
  end if;

  v_is_correct := (v_normalized_answer = v_expected_answer);

  insert into public.riddle_submissions (user_id, riddle_id, submitted_answer, normalized_answer, is_correct)
  values (v_user_id, p_riddle_id, p_answer, v_normalized_answer, v_is_correct);

  if not v_is_correct then
    return jsonb_build_object('status', 'incorrect');
  end if;

  update public.profiles p
  set
    total_points = p.total_points + 10,
    current_streak = case
      when p.last_solved_date = current_date - 1 then p.current_streak + 1
      when p.last_solved_date = current_date then p.current_streak
      else 1
    end,
    last_solved_date = current_date
  where p.id = v_user_id
  returning current_streak into v_current_streak;

  return jsonb_build_object(
    'status', 'correct',
    'awarded_points', 10,
    'current_streak', v_current_streak
  );
end;
$$;

-- Storage bucket for optional riddle illustrations
insert into storage.buckets (id, name, public)
values ('riddle-images', 'riddle-images', true)
on conflict (id) do nothing;
