"use client";

import { clearDailyRiddleAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function ClearDailyRiddleButton() {
  return (
    <form action={clearDailyRiddleAction}>
      <Button type="submit" variant="outline" size="sm">
        Use automatic daily
      </Button>
    </form>
  );
}
