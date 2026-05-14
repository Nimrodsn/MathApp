import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Math Master 5U",
  description: "Daily competitive math riddles for high school students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isLoggedIn = false;
  let isAdmin = false;
  let userProfile: {
    displayName: string | null;
    email: string | null;
    avatarIconId: string | null;
  } | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    isAdmin = Boolean(
      user?.email &&
        process.env.ADMIN_EMAIL &&
        user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase(),
    );

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name,email,avatar_icon")
        .eq("id", user.id)
        .maybeSingle<{ display_name: string; email: string; avatar_icon: string | null }>();

      if (!profileError && profile) {
        userProfile = {
          displayName: profile.display_name ?? null,
          email: profile.email ?? user.email ?? null,
          avatarIconId: profile.avatar_icon ?? null,
        };
      } else {
        userProfile = {
          displayName: null,
          email: user.email ?? null,
          avatarIconId: null,
        };
      }
    }
  } catch {
    // Env keys are not connected yet, so header stays in guest mode.
  }

  return (
    <html lang="he" className={`${rubik.variable} h-full min-w-0 overflow-x-clip antialiased`}>
      <body className="flex min-h-full min-w-0 flex-col" dir="rtl">
        <AppHeader isLoggedIn={isLoggedIn} isAdmin={isAdmin} user={userProfile} />
        <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 overflow-x-clip px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
