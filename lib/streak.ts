import { Flame } from "lucide-react";

export function getStreakMessage(streak: number) {
  if (streak <= 1) {
    return "Start your streak today!";
  }

  if (streak < 5) {
    return `${streak} days in a row. Keep going!`;
  }

  return `${streak} day hot streak!`;
}

export const StreakIcon = Flame;
