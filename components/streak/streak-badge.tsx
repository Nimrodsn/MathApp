import { Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getStreakMessage } from "@/lib/streak";

type StreakBadgeProps = {
  streak: number;
};

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) {
    return null;
  }

  return (
    <Badge variant="success" className="gap-1.5">
      <Flame className="size-3.5" />
      {getStreakMessage(streak)}
    </Badge>
  );
}
