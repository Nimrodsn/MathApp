export type HeaderUser = {
  displayName: string | null;
  email: string | null;
  avatarIconId?: string | null;
};

export function primaryLabel(user: HeaderUser): string {
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }
  if (user.email) {
    const local = user.email.split("@")[0];
    return local || user.email;
  }
  return "User";
}
