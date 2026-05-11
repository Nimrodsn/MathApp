"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { useActionState, useEffect } from "react";

import { submitAnswerAction, type SubmitAnswerState } from "@/app/riddle/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StreakBadge } from "@/components/streak/streak-badge";

const initialState: SubmitAnswerState = {
  status: "idle",
  message: "",
};

type RiddleCardProps = {
  riddleId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  alreadySolved?: boolean;
};

export function RiddleCard({
  riddleId,
  title,
  content,
  imageUrl,
  alreadySolved = false,
}: RiddleCardProps) {
  const [state, formAction, pending] = useActionState(submitAnswerAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      void confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [state.status]);

  return (
    <Card className="border-indigo-200 shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Solve today’s challenge to earn 10 points and keep your streak alive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="prose prose-indigo max-w-none rounded-lg bg-indigo-50 p-4 prose-headings:text-primary"
          dir="ltr"
          lang="en"
        >
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {content}
          </ReactMarkdown>
        </div>
        {imageUrl ? (
          <div className="relative h-64 w-full overflow-hidden rounded-lg border border-indigo-100">
            <Image src={imageUrl} alt="Riddle visual" fill className="object-cover" unoptimized />
          </div>
        ) : null}
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="riddleId" value={riddleId} />
          <label className="block space-y-2 text-sm font-medium">
            <span>Your answer</span>
            <Input
              name="answer"
              placeholder="Type your final answer..."
              disabled={alreadySolved}
              required
            />
          </label>
          <Button disabled={pending || alreadySolved} type="submit">
            {alreadySolved ? "Already Solved" : pending ? "Checking..." : "Submit Answer"}
          </Button>
        </form>
        {state.message ? (
          <p
            className={
              state.status === "success"
                ? "text-sm text-green-700"
                : state.status === "error"
                  ? "text-sm text-red-600"
                  : "text-sm text-indigo-700"
            }
          >
            {state.message}
          </p>
        ) : null}
        {typeof state.streak === "number" ? <StreakBadge streak={state.streak} /> : null}
      </CardContent>
    </Card>
  );
}
