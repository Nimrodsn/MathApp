"use client";

import { Trash2 } from "lucide-react";

import { deleteRiddleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type DeleteRiddleButtonProps = {
  id: string;
};

export function DeleteRiddleButton({ id }: DeleteRiddleButtonProps) {
  return (
    <form
      action={deleteRiddleAction}
      onSubmit={(event) => {
        if (
          !confirm(
            "Delete this riddle? All student submissions for it will be removed. This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm" className="text-red-600 hover:text-red-700">
        <Trash2 className="size-4" />
        Delete
      </Button>
    </form>
  );
}
