import Link from "next/link";
import { Brain } from "lucide-react";

import { AppHeaderNav } from "@/components/app-header-nav";
import type { HeaderUser } from "@/lib/header-user";

export type { HeaderUser } from "@/lib/header-user";

type AppHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: HeaderUser | null;
};

export function AppHeader({ isLoggedIn, isAdmin, user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 text-primary">
          <Brain className="h-6 w-6 shrink-0" />
          <span className="truncate text-lg font-bold">Math Master 5U</span>
        </Link>
        <AppHeaderNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} user={user} />
      </div>
    </header>
  );
}
