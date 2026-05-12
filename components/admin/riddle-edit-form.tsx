"use client";

import Image from "next/image";
import { useActionState } from "react";

import { updateRiddleAction, type AdminActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: AdminActionState = {
  status: "idle",
  message: "",
};

type RiddleEditFormProps = {
  id: string;
  title: string;
  content: string;
  correctAnswer: string;
  releaseDate: string;
  imageUrl: string | null;
};

export function RiddleEditForm({
  id,
  title,
  content,
  correctAnswer,
  releaseDate,
  imageUrl,
}: RiddleEditFormProps) {
  const [state, formAction, pending] = useActionState(updateRiddleAction, initialState);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle>Edit riddle</CardTitle>
        <CardDescription>
          Answers are stored normalized (lowercase, no spaces). Students’ submissions are compared the
          same way.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" encType="multipart/form-data">
          <input type="hidden" name="id" value={id} />

          <label className="block space-y-2 text-sm font-medium">
            <span>Title</span>
            <Input name="title" required defaultValue={title} />
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span>Riddle content (Markdown + LaTeX)</span>
            <Textarea name="content" required defaultValue={content} rows={10} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              <span>Correct answer</span>
              <Input name="correctAnswer" required defaultValue={correctAnswer} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Release date</span>
              <Input name="releaseDate" type="date" dir="ltr" required defaultValue={releaseDate} />
            </label>
          </div>

          {imageUrl ? (
            <div className="space-y-2">
              <span className="text-sm font-medium">Current image</span>
              <div className="relative h-48 w-full max-w-md overflow-hidden rounded-lg border">
                <Image src={imageUrl} alt="Riddle" fill className="object-cover" unoptimized />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="removeImage" className="rounded border" />
                Remove image
              </label>
            </div>
          ) : null}

          <label className="block space-y-2 text-sm font-medium">
            <span>
              {imageUrl ? "Replace image (optional)" : "Optional image"} (max ~10 MB)
            </span>
            <Input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/*" />
          </label>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>

        {state.message ? (
          <p
            className={
              state.status === "success" ? "mt-3 text-sm text-green-700" : "mt-3 text-sm text-red-600"
            }
          >
            {state.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
