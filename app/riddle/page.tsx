import { Brain } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getTodayRiddle, hasSolvedRiddle } from "@/lib/riddle";
import { RiddleCard } from "@/components/riddle/riddle-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RiddlePage() {
  const user = await requireUser();
  const riddle = await getTodayRiddle();

  if (!riddle) {
    return (
      <div className="w-full py-8">
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle>No riddle released yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              The next challenge is on its way. Check back after your teacher publishes today’s
              riddle.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alreadySolved = await hasSolvedRiddle(user.id, riddle.id);

  return (
    <div className="w-full space-y-4 py-6">
      <div className="flex items-center gap-2 text-primary">
        <Brain className="size-5" />
        <h1 className="text-xl font-bold sm:text-2xl">Daily Riddle</h1>
      </div>
      <RiddleCard
        riddleId={riddle.id}
        title={riddle.title}
        content={riddle.content_markdown}
        imageUrl={riddle.image_url}
        alreadySolved={alreadySolved}
      />
    </div>
  );
}
