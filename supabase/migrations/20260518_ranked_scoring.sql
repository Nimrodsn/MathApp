-- Ranked scoring: 1st correct solver on a riddle gets 10 pts, 2nd gets 9, … 10th+ gets 1.

alter table public.riddle_submissions
  add column if not exists solve_rank integer,
  add column if not exists awarded_points integer;

create or replace function public.award_correct_submission(
  p_riddle_id uuid,
  p_user_id uuid,
  p_answer text,
  p_normalized_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rank integer;
  v_points integer;
  v_current_streak integer := 0;
begin
  perform pg_advisory_xact_lock(hashtext(p_riddle_id::text));

  if exists (
    select 1
    from public.riddle_submissions s
    where s.user_id = p_user_id
      and s.riddle_id = p_riddle_id
      and s.is_correct = true
  ) then
    return jsonb_build_object('status', 'already_solved');
  end if;

  v_rank := 1 + (
    select count(*)::integer
    from public.riddle_submissions s
    where s.riddle_id = p_riddle_id
      and s.is_correct = true
  );

  v_points := greatest(1, 11 - v_rank);

  insert into public.riddle_submissions (
    user_id,
    riddle_id,
    submitted_answer,
    normalized_answer,
    is_correct,
    solve_rank,
    awarded_points
  )
  values (
    p_user_id,
    p_riddle_id,
    p_answer,
    p_normalized_answer,
    true,
    v_rank,
    v_points
  );

  update public.profiles p
  set
    total_points = p.total_points + v_points,
    current_streak = case
      when p.last_solved_date = current_date - 1 then p.current_streak + 1
      when p.last_solved_date = current_date then p.current_streak
      else 1
    end,
    last_solved_date = current_date
  where p.id = p_user_id
  returning p.current_streak into v_current_streak;

  return jsonb_build_object(
    'status', 'correct',
    'awarded_points', v_points,
    'solve_rank', v_rank,
    'current_streak', v_current_streak
  );
exception
  when unique_violation then
    return jsonb_build_object('status', 'already_solved');
end;
$$;

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
