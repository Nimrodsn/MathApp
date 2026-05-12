import { User } from "lucide-react";

import { AvatarPickerForm } from "@/components/profile/avatar-picker-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name,email,avatar_icon")
    .eq("id", user.id)
    .maybeSingle<{ display_name: string; email: string; avatar_icon: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="w-full max-w-2xl space-y-4 py-6">
      <div className="flex items-center gap-2 text-primary">
        <User className="size-6" />
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <Card className="border-indigo-200">
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>
            {profile?.display_name ? (
              <>
                Signed in as <span className="font-medium text-foreground">{profile.display_name}</span>
                {profile.email ? (
                  <span className="block text-muted-foreground">{profile.email}</span>
                ) : null}
              </>
            ) : (
              "Pick an icon that appears in the header and on the leaderboard."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarPickerForm currentAvatarId={profile?.avatar_icon} />
        </CardContent>
      </Card>
    </div>
  );
}
