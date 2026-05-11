import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  return data.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/riddle");
  }

  return user;
}
