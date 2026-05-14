"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Menu, Trophy } from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type HeaderUser, primaryLabel } from "@/lib/header-user";
import { ProfileAvatarIcon } from "@/lib/profile-avatars";

type AppHeaderNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: HeaderUser | null;
};

function NavLinks({
  isLoggedIn,
  isAdmin,
  wrapClose,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  wrapClose: boolean;
}) {
  const wrap = (node: ReactElement) =>
    wrapClose ? <SheetClose asChild>{node}</SheetClose> : node;

  return (
    <>
      {wrap(
        <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
          <Link href="/riddle">Daily Riddle</Link>
        </Button>,
      )}
      {wrap(
        <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
          <Link href="/leaderboard">
            <Trophy className="size-4" />
            Leaderboard
          </Link>
        </Button>,
      )}
      {isLoggedIn
        ? wrap(
            <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
              <Link href="/riddles">All riddles</Link>
            </Button>,
          )
        : null}
      {isAdmin ? (
        <>
          {wrap(
            <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
              <Link href="/admin">Admin</Link>
            </Button>,
          )}
          {wrap(
            <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
              <Link href="/admin/riddles">Riddles</Link>
            </Button>,
          )}
          {wrap(
            <Button asChild variant="ghost" size="sm" className={wrapClose ? "w-full justify-start" : undefined}>
              <Link href="/admin/leaderboard">Scores</Link>
            </Button>,
          )}
        </>
      ) : null}
    </>
  );
}

export function AppHeaderNav({ isLoggedIn, isAdmin, user }: AppHeaderNavProps) {
  return (
    <>
      <nav className="hidden min-w-0 items-center gap-2 md:flex">
        <Button asChild variant="ghost" size="sm">
          <Link href="/riddle">Daily Riddle</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/leaderboard">
            <Trophy className="size-4" />
            Leaderboard
          </Link>
        </Button>
        {isLoggedIn ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/riddles">All riddles</Link>
          </Button>
        ) : null}
        {isAdmin ? (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/riddles">Riddles</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/leaderboard">Scores</Link>
            </Button>
          </>
        ) : null}
        {isLoggedIn ? (
          <div className="flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2 lg:max-w-xs">
            {user ? (
              <>
                <ProfileAvatarIcon id={user.avatarIconId} className="size-8 shrink-0 text-primary" />
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
            <Button asChild size="sm" variant="ghost" className="shrink-0">
              <Link href="/profile">Profile</Link>
            </Button>
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

      <div className="flex shrink-0 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Open navigation menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex max-h-[100dvh] flex-col overflow-y-auto pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1">
              <NavLinks isLoggedIn={isLoggedIn} isAdmin={isAdmin} wrapClose />
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
              {isLoggedIn ? (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <ProfileAvatarIcon id={user.avatarIconId} className="size-10 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-sm font-semibold text-foreground">{primaryLabel(user)}</p>
                        {user.email &&
                        user.displayName?.trim() &&
                        user.displayName.trim().toLowerCase() !== user.email.trim().toLowerCase() ? (
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <SheetClose asChild>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                      <Link href="/profile">Profile</Link>
                    </Button>
                  </SheetClose>
                  <form action={signOutAction}>
                    <Button size="sm" variant="secondary" type="submit" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <SheetClose asChild>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
