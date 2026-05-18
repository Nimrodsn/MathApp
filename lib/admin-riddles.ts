import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminRiddleRow = {
  id: string;
  title: string;
  content_markdown: string;
  image_path: string | null;
  correct_answer_normalized: string;
  release_date: string;
  is_daily_featured: boolean;
  created_at: string;
};

export async function fetchAllRiddlesAdmin(): Promise<AdminRiddleRow[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("riddles")
    .select(
      "id,title,content_markdown,image_path,correct_answer_normalized,release_date,is_daily_featured,created_at",
    )
    .order("release_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchRiddleByIdAdmin(id: string): Promise<AdminRiddleRow | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("riddles")
    .select(
      "id,title,content_markdown,image_path,correct_answer_normalized,release_date,is_daily_featured,created_at",
    )
    .eq("id", id)
    .maybeSingle<AdminRiddleRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function getPublicImageUrl(imagePath: string | null): string | null {
  if (!imagePath) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("riddle-images").getPublicUrl(imagePath);

  return publicUrl;
}
