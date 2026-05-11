import Link from "next/link";
import { Brain, Trophy, UserCircle } from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export type HeaderUser = {
  displayName: string | null;
  email: string | null;
};

type AppHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: HeaderUser | null;
};

function primaryLabel(user: HeaderUser) {
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }
  if (user.email) {
    const local = user.email.split("@")[0];
    return local || user.email;
  }
  return "User";
}

export function AppHeader({ isLoggedIn, isAdmin, user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Brain className="h-6 w-6" />
          <span className="text-lg font-bold">Math Master 5U</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/riddle">Daily Riddle</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/leaderboard">
              <Trophy className="size-4" />
              Leaderboard
            </Link>
          </Button>
          {isAdmin ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/admin/riddles">Riddles</Link>
              </Button>
            </>
          ) : null}
          {isLoggedIn ? (
            <div className="flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2 sm:max-w-xs">
              {user ? (
                <>
                  <UserCircle className="size-8 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate text-sm font-semibold text-foreground">{primaryLabel(user)}</p>
                    {user.email &&
                    user.displayName?.trim() &&
                    user.displayName.trim().toLowerCase() !== user.email.trim().toLowerCase() ? (
                      <p className="hidden truncate text-xs text-muted-foreground sm:block">{user.email}</p>
                    ) : null}
                  </div>
                </>
              ) : null}
              <form action={signOutAction} className="shrink-0">
                <Button size="sm" variant="secondary" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
