"use client";

import { useActionState, useEffect, useState } from "react";

import { updateProfileAvatarAction, type ProfileAvatarState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import {
  PROFILE_AVATAR_IDS,
  ProfileAvatarIcon,
  resolveProfileAvatarId,
  type ProfileAvatarId,
} from "@/lib/profile-avatars";

const initialState: ProfileAvatarState = {
  status: "idle",
  message: "",
};

type AvatarPickerFormProps = {
  currentAvatarId: string | null | undefined;
};

export function AvatarPickerForm({ currentAvatarId }: AvatarPickerFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAvatarAction, initialState);
  const saved = resolveProfileAvatarId(currentAvatarId);
  const [selected, setSelected] = useState<ProfileAvatarId>(saved);

  useEffect(() => {
    setSelected(saved);
  }, [saved]);

  return (
    <form action={formAction} className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-foreground">Choose an icon</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PROFILE_AVATAR_IDS.map((id) => (
            <label
              key={id}
              className={
                id === selected
                  ? "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-primary bg-primary/5 p-4 ring-2 ring-primary/30"
                  : "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              }
            >
              <input
                type="radio"
                name="avatarId"
                value={id}
                checked={id === selected}
                onChange={() => {
                  setSelected(id);
                }}
                className="sr-only"
              />
              <ProfileAvatarIcon id={id} className="size-10 text-primary" />
              <span className="mt-2 max-w-full truncate text-center text-xs text-muted-foreground">
                {id.replace(/-/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save icon"}
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
