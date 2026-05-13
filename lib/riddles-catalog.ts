import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CatalogRiddleRow = {
  id: string;
  title: string;
  release_date: string;
};

export type CatalogRiddleDetail = {
  id: string;
  title: string;
  content_markdown: string;
  release_date: string;
  image_path: string | null;
  image_url: string | null;
};

function attachImageUrl(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  imagePath: string | null,
): string | null {
  if (!imagePath) {
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("riddle-images").getPublicUrl(imagePath);
  return publicUrl;
}

/** Released riddles only (RLS); no canonical answer. */
export async function fetchReleasedRiddlesCatalog(): Promise<CatalogRiddleRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("riddles")
    .select("id,title,release_date")
    .order("release_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CatalogRiddleRow[];
}

/** Single released riddle for read-only detail; null if not found or not released (RLS). */
export async function fetchReleasedRiddleById(id: string): Promise<CatalogRiddleDetail | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("riddles")
    .select("id,title,content_markdown,image_path,release_date")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      title: string;
      content_markdown: string;
      image_path: string | null;
      release_date: string;
    }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    content_markdown: data.content_markdown,
    release_date: data.release_date,
    image_path: data.image_path,
    image_url: attachImageUrl(supabase, data.image_path),
  };
}
