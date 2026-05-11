import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { requireUser } from "@/lib/auth";
import { getTopProfiles } from "@/lib/riddle";

export default async function LeaderboardPage() {
  await requireUser();
  const users = await getTopProfiles(30);

  return (
    <div className="w-full space-y-4 py-6">
      <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
      <LeaderboardTable users={users} />
    </div>
  );
}
