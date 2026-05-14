import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminLeaderboardProfile = {
  id: string;
  display_name: string;
  email: string;
  total_points: number;
  current_streak: number;
  avatar_icon: string | null;
};

export async function fetchLeaderboardProfilesAdmin(limit = 100): Promise<AdminLeaderboardProfile[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name,email,total_points,current_streak,avatar_icon")
    .order("total_points", { ascending: false })
    .order("current_streak", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminLeaderboardProfile[];
}
