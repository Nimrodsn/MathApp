import { Crown, Medal } from "lucide-react";

import { StreakBadge } from "@/components/streak/streak-badge";
import { ProfileAvatarIcon } from "@/lib/profile-avatars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type LeaderboardUser = {
  id: string;
  display_name: string;
  total_points: number;
  current_streak: number;
  avatar_icon: string | null;
};

type LeaderboardTableProps = {
  users: LeaderboardUser[];
};

export function LeaderboardTable({ users }: LeaderboardTableProps) {
  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-5 text-amber-500" />
          Top Students
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="w-full min-w-0 overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold">
                  <span className="inline-flex items-center gap-1">
                    {index < 3 ? <Medal className="size-4 text-amber-500" /> : null}#{index + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <ProfileAvatarIcon
                      id={user.avatar_icon}
                      className="size-7 shrink-0 text-primary"
                    />
                    <span>{user.display_name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <StreakBadge streak={user.current_streak} />
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {user.total_points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
