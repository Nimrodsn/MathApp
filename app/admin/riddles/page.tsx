import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { startOfToday } from "date-fns";

import { RiddleListTable } from "@/components/admin/riddle-list-table";
import { Button } from "@/components/ui/button";
import { fetchAllRiddlesAdmin } from "@/lib/admin-riddles";
import { requireAdmin } from "@/lib/auth";

export default async function AdminRiddlesPage() {
  await requireAdmin();

  const riddles = await fetchAllRiddlesAdmin();
  const todayIso = startOfToday().toISOString().slice(0, 10);

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ListOrdered className="size-7" />
          Manage riddles
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin#new-riddle">New riddle</Link>
          </Button>
        </div>
      </div>

      <RiddleListTable riddles={riddles} todayIso={todayIso} />
    </div>
  );
}
