import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { startOfToday } from "date-fns";

import { RiddleCatalogTable } from "@/components/riddle/riddle-catalog-table";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { fetchReleasedRiddlesCatalog } from "@/lib/riddles-catalog";

export default async function RiddlesCatalogPage() {
  await requireUser();

  const riddles = await fetchReleasedRiddlesCatalog();
  const todayIso = startOfToday().toISOString().slice(0, 10);

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ListOrdered className="size-7" />
          All riddles
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/riddle">
            <ArrowLeft className="size-4" />
            Today&apos;s riddle
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Past and current challenges (read-only). Answers are hidden here—solve them on the daily
        riddle page when they are active.
      </p>

      <RiddleCatalogTable riddles={riddles} todayIso={todayIso} />
    </div>
  );
}
