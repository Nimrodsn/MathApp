import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RiddleReadOnlyBody } from "@/components/riddle/riddle-read-only-body";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { fetchReleasedRiddleById } from "@/lib/riddles-catalog";

type RiddleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RiddleDetailPage({ params }: RiddleDetailPageProps) {
  await requireUser();

  const { id } = await params;
  const riddle = await fetchReleasedRiddleById(id);

  if (!riddle) {
    notFound();
  }

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/riddles">
            <ArrowLeft className="size-4" />
            All riddles
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/riddle">Today&apos;s riddle</Link>
        </Button>
      </div>

      <Card className="border-indigo-200 shadow-lg">
        <CardContent className="pt-6">
          <RiddleReadOnlyBody
            title={riddle.title}
            contentMarkdown={riddle.content_markdown}
            imageUrl={riddle.image_url}
          />
        </CardContent>
      </Card>
    </div>
  );
}
