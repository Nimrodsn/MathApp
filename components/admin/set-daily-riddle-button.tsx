"use client";

import { Star } from "lucide-react";

import { setDailyRiddleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type SetDailyRiddleButtonProps = {
  id: string;
};

export function SetDailyRiddleButton({ id }: SetDailyRiddleButtonProps) {
  return (
    <form action={setDailyRiddleAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" size="sm">
        <Star className="size-4" />
        Set as daily
      </Button>
    </form>
  );
}
