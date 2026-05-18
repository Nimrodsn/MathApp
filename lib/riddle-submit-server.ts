import "server-only";

import { gradeAnswerClaude } from "@/lib/grade-answer-claude";
import { normalizeAnswer } from "@/lib/normalize-answer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function utcTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function asDateStr(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

type AwardRpcResult = {
  status: string;
  awarded_points?: number;
  solve_rank?: number;
  current_streak?: number;
};

export type RecordRiddleAttemptResult =
  | { status: "correct"; awarded_points: number; solve_rank: number; current_streak: number }
  | { status: "already_solved" }
  | { status: "incorrect" }
  | { status: "not_found" };

/**
 * Grades with AI on the server, then records submissions. Correct solves use
 * `award_correct_submission` RPC for atomic rank/points (1st=10 … 10th+=1).
 */
export async function recordRiddleAttempt(params: {
  userId: string;
  riddleId: string;
  rawAnswer: string;
}): Promise<RecordRiddleAttemptResult> {
  const admin = createSupabaseAdminClient();
  const todayStr = utcTodayStr();

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

  if (!equivalent) {
    const { error: insertError } = await admin.from("riddle_submissions").insert({
      user_id: params.userId,
      riddle_id: params.riddleId,
      submitted_answer: params.rawAnswer,
      normalized_answer: normalizedAnswer,
      is_correct: false,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return { status: "incorrect" };
  }

  const { data: awardData, error: awardError } = await admin.rpc("award_correct_submission", {
    p_riddle_id: params.riddleId,
    p_user_id: params.userId,
    p_answer: params.rawAnswer,
    p_normalized_answer: normalizedAnswer,
  });

  if (awardError) {
    if (awardError.code === "23505") {
      return { status: "already_solved" };
    }
    throw new Error(awardError.message);
  }

  const result = awardData as AwardRpcResult | null;

  if (!result || result.status === "already_solved") {
    return { status: "already_solved" };
  }

  if (result.status !== "correct") {
    throw new Error("Unexpected award_correct_submission response.");
  }

  const awardedPoints = Number(result.awarded_points);
  const solveRank = Number(result.solve_rank);
  const currentStreak = Number(result.current_streak);

  if (!Number.isFinite(awardedPoints) || !Number.isFinite(solveRank) || !Number.isFinite(currentStreak)) {
    throw new Error("Invalid award_correct_submission payload.");
  }

  return {
    status: "correct",
    awarded_points: awardedPoints,
    solve_rank: solveRank,
    current_streak: currentStreak,
  };
}
