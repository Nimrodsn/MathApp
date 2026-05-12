"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getImageFile(formData: FormData): File | null {
  const raw = formData.get("image");
  if (raw instanceof File && raw.size > 0) {
    return raw;
  }
  return null;
}

const createRiddleSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(5),
  correctAnswer: z.string().min(1).max(150),
  releaseDate: z.string().min(10).max(10),
});

export type AdminActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function createRiddleAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireAdmin();

  const parsed = createRiddleSchema.safeParse({
    title: String(formData.get("title")),
    content: String(formData.get("content")),
    correctAnswer: String(formData.get("correctAnswer")),
    releaseDate: String(formData.get("releaseDate")),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please complete all required fields correctly." };
  }

  const supabase = createSupabaseAdminClient();
  const imageFile = getImageFile(formData);
  let imagePath: string | null = null;

  if (imageFile) {
    const extension = imageFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const storagePath = `${parsed.data.releaseDate}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("riddle-images")
      .upload(storagePath, imageFile, {
        contentType: imageFile.type || "image/png",
        upsert: false,
      });

    if (uploadError) {
      return { status: "error", message: uploadError.message };
    }

    imagePath = storagePath;
  }

  const { error } = await supabase.from("riddles").insert({
    title: parsed.data.title,
    content_markdown: parsed.data.content,
    correct_answer_normalized: parsed.data.correctAnswer,
    release_date: parsed.data.releaseDate,
    image_path: imagePath,
    created_by: user.id,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/riddle");
  revalidatePath("/admin");
  revalidatePath("/admin/riddles");

  return { status: "success", message: "Riddle published successfully." };
}

const updateRiddleSchema = createRiddleSchema.extend({
  id: z.string().uuid(),
  removeImage: z.enum(["on"]).optional(),
});

export async function updateRiddleAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = updateRiddleSchema.safeParse({
    id: String(formData.get("id")),
    title: String(formData.get("title")),
    content: String(formData.get("content")),
    correctAnswer: String(formData.get("correctAnswer")),
    releaseDate: String(formData.get("releaseDate")),
    removeImage: formData.get("removeImage") === "on" ? "on" : undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please complete all required fields correctly." };
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("riddles")
    .select("id,image_path,release_date")
    .eq("id", parsed.data.id)
    .maybeSingle<{ id: string; image_path: string | null; release_date: string }>();

  if (fetchError || !existing) {
    return { status: "error", message: fetchError?.message ?? "Riddle not found." };
  }

  const imageFile = getImageFile(formData);
  const oldImagePath = existing.image_path;
  let nextImagePath: string | null | undefined;

  if (imageFile) {
    if (oldImagePath) {
      await supabase.storage.from("riddle-images").remove([oldImagePath]);
    }

    const extension = imageFile.name.split(".").pop()?.toLowerCase() ?? "png";
    const storagePath = `${parsed.data.releaseDate}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("riddle-images")
      .upload(storagePath, imageFile, {
        contentType: imageFile.type || "image/png",
        upsert: false,
      });

    if (uploadError) {
      return { status: "error", message: uploadError.message };
    }

    nextImagePath = storagePath;
  } else if (parsed.data.removeImage) {
    if (oldImagePath) {
      await supabase.storage.from("riddle-images").remove([oldImagePath]);
    }

    nextImagePath = null;
  }

  const payload: Record<string, unknown> = {
    title: parsed.data.title,
    content_markdown: parsed.data.content,
    correct_answer_normalized: parsed.data.correctAnswer,
    release_date: parsed.data.releaseDate,
  };

  if (nextImagePath !== undefined) {
    payload.image_path = nextImagePath;
  }

  const { error } = await supabase.from("riddles").update(payload).eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/riddle");
  revalidatePath("/admin");
  revalidatePath("/admin/riddles");
  revalidatePath(`/admin/riddles/${parsed.data.id}/edit`);

  return { status: "success", message: "Riddle updated successfully." };
}

const deleteRiddleSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteRiddleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = deleteRiddleSchema.safeParse({
    id: String(formData.get("id")),
  });

  if (!parsed.success) {
    redirect("/admin/riddles");
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("riddles")
    .select("image_path")
    .eq("id", parsed.data.id)
    .maybeSingle<{ image_path: string | null }>();

  if (fetchError || !existing) {
    redirect("/admin/riddles");
  }

  if (existing.image_path) {
    await supabase.storage.from("riddle-images").remove([existing.image_path]);
  }

  const { error } = await supabase.from("riddles").delete().eq("id", parsed.data.id);

  if (error) {
    redirect("/admin/riddles");
  }

  revalidatePath("/riddle");
  revalidatePath("/admin");
  revalidatePath("/admin/riddles");

  redirect("/admin/riddles");
}
