-- Admin-selected daily riddle: one featured riddle visible on /riddle (including scheduled).

alter table public.riddles
  add column if not exists is_daily_featured boolean not null default false;

create unique index if not exists uniq_riddles_daily_featured
  on public.riddles (is_daily_featured)
  where is_daily_featured = true;

drop policy if exists "riddles_select_released" on public.riddles;
create policy "riddles_select_released"
  on public.riddles
  for select
  to authenticated
  using (release_date <= current_date or is_daily_featured = true);

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
begin
  if v_user_id is null then
    return jsonb_build_object('status', 'unauthorized');
  end if;

  select r.correct_answer_normalized
  into v_expected_answer
  from public.riddles r
  where r.id = p_riddle_id
    and (r.release_date <= current_date or r.is_daily_featured = true);

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

  if not v_is_correct then
    insert into public.riddle_submissions (user_id, riddle_id, submitted_answer, normalized_answer, is_correct)
    values (v_user_id, p_riddle_id, p_answer, v_normalized_answer, false);

    return jsonb_build_object('status', 'incorrect');
  end if;

  return public.award_correct_submission(
    p_riddle_id,
    v_user_id,
    p_answer,
    v_normalized_answer
  );
end;
$$;
