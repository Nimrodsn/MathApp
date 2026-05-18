"use client";

import { useActionState } from "react";

import {
  updateDisplayNameAction,
  type ProfileDisplayNameState,
} from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ProfileDisplayNameState = {
  status: "idle",
  message: "",
};

type DisplayNameFormProps = {
  currentDisplayName: string;
  signInEmail: string;
};

export function DisplayNameForm({ currentDisplayName, signInEmail }: DisplayNameFormProps) {
  const [state, formAction, pending] = useActionState(updateDisplayNameAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display name
        </label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={currentDisplayName}
          maxLength={80}
          autoComplete="nickname"
          required
        />
        <p className="text-xs text-muted-foreground">
          Shown in the header and on the leaderboard. Email is used for sign-in and cannot be
          changed here.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium text-foreground">Sign-in email</span>
        <p className="mt-1 break-all text-muted-foreground">{signInEmail}</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
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
    </form>
  );
}
