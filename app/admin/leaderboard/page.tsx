import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

import { LeaderboardEditCard } from "@/components/admin/leaderboard-edit-card";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { fetchLeaderboardProfilesAdmin } from "@/lib/admin-leaderboard";

export default async function AdminLeaderboardPage() {
  await requireAdmin();

  const profiles = await fetchLeaderboardProfilesAdmin(100);

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Trophy className="size-7" />
          Edit leaderboard scores
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              Admin
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/leaderboard">View public leaderboard</Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Adjust total points and current streak for any student. Changes apply immediately and show
        on the public leaderboard after save.
      </p>

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No profiles yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((user) => (
            <LeaderboardEditCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
