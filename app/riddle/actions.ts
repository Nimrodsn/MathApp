"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordRiddleAttempt } from "@/lib/riddle-submit-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SubmitAnswerState = {
  message: string;
  status: "idle" | "error" | "success" | "info";
  awardedPoints?: number;
  streak?: number;
};

const submitSchema = z.object({
  riddleId: z.string().uuid(),
  answer: z.string().min(1).max(200),
});

export async function submitAnswerAction(
  _prevState: SubmitAnswerState,
  formData: FormData,
): Promise<SubmitAnswerState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please log in before submitting." };
  }

  const parsed = submitSchema.safeParse({
    riddleId: String(formData.get("riddleId")),
    answer: String(formData.get("answer")),
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid answer before submitting." };
  }

  let payload:
    | { status: "correct"; awarded_points: number; current_streak: number }
    | { status: "already_solved" }
    | { status: "incorrect" }
    | { status: "not_found" };

  try {
    payload = await recordRiddleAttempt({
      userId: user.id,
      riddleId: parsed.data.riddleId,
      rawAnswer: parsed.data.answer,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return { status: "error", message };
  }

  revalidatePath("/riddle");
  revalidatePath("/leaderboard");

  if (payload.status === "correct") {
    return {
      status: "success",
      message: "Brilliant! +10 points added.",
      awardedPoints: payload.awarded_points,
      streak: payload.current_streak,
    };
  }

  if (payload.status === "already_solved") {
    return {
      status: "info",
      message: "You already solved today’s riddle. Come back tomorrow!",
    };
  }

  if (payload.status === "not_found") {
    return {
      status: "error",
      message: "This riddle isn’t available yet or could not be loaded.",
    };
  }

  return {
    status: "error",
    message: "Not quite. Try another approach and submit again.",
  };
}
