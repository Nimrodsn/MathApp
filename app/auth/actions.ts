"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthState = {
  error?: string;
};

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (!parsed.success) {
    return { error: "Please provide a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/riddle");
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (!parsed.success) {
    return { error: "Please provide a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  return { error: "Account created. You can now log in." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
