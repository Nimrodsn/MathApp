import "server-only";

import { gradeAnswerClaude } from "@/lib/grade-answer-claude";
import { normalizeAnswer } from "@/lib/normalize-answer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function utcTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function utcYesterdayStr(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function asDateStr(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export type RecordRiddleAttemptResult =
  | { status: "correct"; awarded_points: number; current_streak: number }
  | { status: "already_solved" }
  | { status: "incorrect" }
  | { status: "not_found" };

/**
 * Mirrors `public.submit_riddle_answer` using the service-role client so AI grading
 * can run on the server without exposing the canonical answer to the browser.
 */
export async function recordRiddleAttempt(params: {
  userId: string;
  riddleId: string;
  rawAnswer: string;
}): Promise<RecordRiddleAttemptResult> {
  const admin = createSupabaseAdminClient();
  const todayStr = utcTodayStr();
  const yesterdayStr = utcYesterdayStr();

  const { data: riddle, error: riddleError } = await admin
    .from("riddles")
    .select("id, title, content_markdown, correct_answer_normalized, release_date")
    .eq("id", params.riddleId)
    .maybeSingle();

  if (riddleError || !riddle) {
    return { status: "not_found" };
  }

  const releaseDate = asDateStr(riddle.release_date);
  if (!releaseDate || releaseDate > todayStr) {
    return { status: "not_found" };
  }

  const { data: existingCorrect } = await admin
    .from("riddle_submissions")
    .select("id")
    .eq("user_id", params.userId)
    .eq("riddle_id", params.riddleId)
    .eq("is_correct", true)
    .maybeSingle();

  if (existingCorrect) {
    return { status: "already_solved" };
  }

  const equivalent = await gradeAnswerClaude({
    title: riddle.title,
    contentMarkdown: riddle.content_markdown,
    referenceAnswer: riddle.correct_answer_normalized,
    studentAnswer: params.rawAnswer,
  });

  const normalizedAnswer = normalizeAnswer(params.rawAnswer);

  const { error: insertError } = await admin.from("riddle_submissions").insert({
    user_id: params.userId,
    riddle_id: params.riddleId,
    submitted_answer: params.rawAnswer,
    normalized_answer: normalizedAnswer,
    is_correct: equivalent,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { status: "already_solved" };
    }
    throw new Error(insertError.message);
  }

  if (!equivalent) {
    return { status: "incorrect" };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("last_solved_date, current_streak, total_points")
    .eq("id", params.userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found.");
  }

  const lastStr = asDateStr(profile.last_solved_date);

  let newStreak: number;
  if (lastStr === yesterdayStr) {
    newStreak = profile.current_streak + 1;
  } else if (lastStr === todayStr) {
    newStreak = profile.current_streak;
  } else {
    newStreak = 1;
  }

  const { data: updated, error: updateError } = await admin
    .from("profiles")
    .update({
      total_points: profile.total_points + 10,
      current_streak: newStreak,
      last_solved_date: todayStr,
    })
    .eq("id", params.userId)
    .select("current_streak")
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message ?? "Failed to update profile.");
  }

  return {
    status: "correct",
    awarded_points: 10,
    current_streak: updated.current_streak,
  };
}
