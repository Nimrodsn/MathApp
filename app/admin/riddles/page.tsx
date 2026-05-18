import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { startOfToday } from "date-fns";

import { ClearDailyRiddleButton } from "@/components/admin/clear-daily-riddle-button";
import { RiddleListTable } from "@/components/admin/riddle-list-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAllRiddlesAdmin } from "@/lib/admin-riddles";
import { requireAdmin } from "@/lib/auth";

export default async function AdminRiddlesPage() {
  await requireAdmin();

  const riddles = await fetchAllRiddlesAdmin();
  const todayIso = startOfToday().toISOString().slice(0, 10);
  const featured = riddles.find((r) => r.is_daily_featured);

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ListOrdered className="size-7" />
          Manage riddles
        </h1>
        <div className="flex flex-wrap gap-2">
          {featured ? <ClearDailyRiddleButton /> : null}
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

      <Card className="border-indigo-100 bg-indigo-50/40">
        <CardContent className="pt-6 text-sm text-gray-700">
          {featured ? (
            <p>
              Students see <strong>{featured.title}</strong> on the daily riddle page (release{" "}
              {featured.release_date}
              {featured.release_date > todayIso ? ", shown before release" : ""}).
            </p>
          ) : (
            <p>
              No manual daily pick. Students see the latest released riddle (newest{" "}
              <code className="rounded bg-white/80 px-1">release_date</code> on or before today).
            </p>
          )}
        </CardContent>
      </Card>

      <RiddleListTable riddles={riddles} todayIso={todayIso} />
    </div>
  );
}
