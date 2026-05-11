import Link from "next/link";
import { ListOrdered, ShieldCheck } from "lucide-react";

import { RiddleUploadForm } from "@/components/admin/riddle-upload-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ShieldCheck className="size-6" />
          Admin Dashboard
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/riddles">
            <ListOrdered className="size-4" />
            View all riddles
          </Link>
        </Button>
      </div>
      <div id="new-riddle">
        <RiddleUploadForm />
      </div>
    </div>
  );
}
