import Link from "next/link";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-10">
      <Card className="border-indigo-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-3xl sm:text-4xl">Math Master 5U</CardTitle>
          <p className="text-base text-indigo-800 sm:text-lg">
            Solve one riddle every day, earn points, build your streak, and race to the top.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/riddle">
              Start Today’s Riddle
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/leaderboard">
              <Trophy className="size-4" />
              View Leaderboard
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-indigo-100">
          <CardContent className="p-5">
            <p className="font-semibold text-primary">Daily Challenge</p>
            <p className="text-sm text-gray-700">New puzzle each day tailored to 5-unit level.</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-5">
            <p className="font-semibold text-amber-700">Points and Rankings</p>
            <p className="text-sm text-gray-700">
              Faster correct answers earn more: 1st gets 10 pts, 2nd gets 9, … 10th+ gets 1.
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200">
          <CardContent className="p-5">
            <p className="font-semibold text-emerald-700">Streak Mode</p>
            <p className="text-sm text-gray-700">
              <Sparkles className="mr-1 inline size-4" />
              Consecutive wins unlock a fire streak badge.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
