"use client";

import { useActionState } from "react";

import {
  updateProfileScoresAction,
  type LeaderboardEditState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileAvatarIcon } from "@/lib/profile-avatars";
import type { AdminLeaderboardProfile } from "@/lib/admin-leaderboard";

const initialState: LeaderboardEditState = {
  status: "idle",
  message: "",
};

type LeaderboardEditCardProps = {
  user: AdminLeaderboardProfile;
};

export function LeaderboardEditCard({ user }: LeaderboardEditCardProps) {
  const [state, formAction, pending] = useActionState(updateProfileScoresAction, initialState);

  return (
    <Card className="border-amber-200">
      <form action={formAction}>
        <input type="hidden" name="userId" value={user.id} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ProfileAvatarIcon id={user.avatar_icon} className="size-8 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{user.display_name}</span>
          </CardTitle>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={`points-${user.id}`} className="text-sm font-medium">
              Total points
            </label>
            <Input
              id={`points-${user.id}`}
              name="totalPoints"
              type="number"
              min={0}
              max={1_000_000}
              step={1}
              defaultValue={user.total_points}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`streak-${user.id}`} className="text-sm font-medium">
              Current streak
            </label>
            <Input
              id={`streak-${user.id}`}
              name="currentStreak"
              type="number"
              min={0}
              max={100_000}
              step={1}
              defaultValue={user.current_streak}
              required
              dir="ltr"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save scores"}
          </Button>
          {state.message ? (
            <p
              className={
                state.status === "success" ? "text-sm text-green-700" : "text-sm text-red-600"
              }
            >
              {state.message}
            </p>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
}
