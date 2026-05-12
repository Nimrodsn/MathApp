import { startOfToday } from "date-fns";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DailyRiddle = {
  id: string;
  title: string;
  content_markdown: string;
  image_path: string | null;
  release_date: string;
};

export async function getTodayRiddle() {
  const supabase = await createSupabaseServerClient();
  const today = startOfToday().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("riddles")
    .select("id,title,content_markdown,image_path,release_date")
    .lte("release_date", today)
    .order("release_date", { ascending: false })
    .limit(1)
    .maybeSingle<DailyRiddle>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  let imageUrl: string | null = null;
  if (data.image_path) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("riddle-images").getPublicUrl(data.image_path);
    imageUrl = publicUrl;
  }

  return { ...data, image_url: imageUrl };
}

export async function hasSolvedRiddle(userId: string, riddleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("riddle_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("riddle_id", riddleId)
    .eq("is_correct", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function getTopProfiles(limit = 25) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name,total_points,current_streak,avatar_icon")
    .order("total_points", { ascending: false })
    .order("current_streak", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
