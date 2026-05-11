"use client";

import { useActionState } from "react";

import { createRiddleAction, type AdminActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: AdminActionState = {
  status: "idle",
  message: "",
};

export function RiddleUploadForm() {
  const [state, formAction, pending] = useActionState(createRiddleAction, initialState);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle>Upload New Riddle</CardTitle>
        <CardDescription>
          Markdown and LaTeX are supported (`$x^2+1$`, `$$\\int_0^1 x dx$$`).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" encType="multipart/form-data">
          <label className="block space-y-2 text-sm font-medium">
            <span>Title</span>
            <Input name="title" required placeholder="A clever title..." />
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span>Riddle content (Markdown + LaTeX)</span>
            <Textarea name="content" required placeholder="Write your riddle here..." />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              <span>Correct answer</span>
              <Input name="correctAnswer" required placeholder="42" />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Release date</span>
              <Input name="releaseDate" type="date" dir="ltr" required />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium">
            <span>Optional image</span>
            <Input name="image" type="file" accept="image/*" />
          </label>

          <Button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Publish riddle"}
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
