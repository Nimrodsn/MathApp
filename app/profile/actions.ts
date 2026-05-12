"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { isProfileAvatarId } from "@/lib/profile-avatars";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileAvatarState = {
  status: "idle" | "error" | "success";
  message: string;
};

const schema = z.object({
  avatarId: z.string().min(1),
});

export async function updateProfileAvatarAction(
  _prevState: ProfileAvatarState,
  formData: FormData,
): Promise<ProfileAvatarState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    avatarId: String(formData.get("avatarId")),
  });

  if (!parsed.success || !isProfileAvatarId(parsed.data.avatarId)) {
    return { status: "error", message: "Choose a valid icon." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_icon: parsed.data.avatarId })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/leaderboard");

  return { status: "success", message: "Profile icon updated." };
}
