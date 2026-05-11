import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RiddleEditForm } from "@/components/admin/riddle-edit-form";
import { Button } from "@/components/ui/button";
import { fetchRiddleByIdAdmin, getPublicImageUrl } from "@/lib/admin-riddles";
import { requireAdmin } from "@/lib/auth";

type EditRiddlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRiddlePage({ params }: EditRiddlePageProps) {
  await requireAdmin();

  const { id } = await params;
  const riddle = await fetchRiddleByIdAdmin(id);

  if (!riddle) {
    notFound();
  }

  const imageUrl = getPublicImageUrl(riddle.image_path);

  return (
    <div className="w-full space-y-4 py-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/admin/riddles">
          <ArrowLeft className="size-4" />
          All riddles
        </Link>
      </Button>

      <RiddleEditForm
        id={riddle.id}
        title={riddle.title}
        content={riddle.content_markdown}
        correctAnswer={riddle.correct_answer_normalized}
        releaseDate={riddle.release_date}
        imageUrl={imageUrl}
      />
    </div>
  );
}
