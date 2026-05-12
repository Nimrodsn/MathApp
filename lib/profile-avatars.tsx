import type { LucideIcon } from "lucide-react";
import {
  Atom,
  Brain,
  Calculator,
  Compass,
  Flame,
  Gem,
  GraduationCap,
  Heart,
  Infinity,
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserCircle,
} from "lucide-react";

export const PROFILE_AVATAR_IDS = [
  "user-circle",
  "brain",
  "trophy",
  "sparkles",
  "rocket",
  "atom",
  "graduation-cap",
  "lightbulb",
  "star",
  "heart",
  "flame",
  "compass",
  "calculator",
  "gem",
  "target",
  "infinity",
] as const;

export type ProfileAvatarId = (typeof PROFILE_AVATAR_IDS)[number];

const ICON_MAP: Record<ProfileAvatarId, LucideIcon> = {
  "user-circle": UserCircle,
  brain: Brain,
  trophy: Trophy,
  sparkles: Sparkles,
  rocket: Rocket,
  atom: Atom,
  "graduation-cap": GraduationCap,
  lightbulb: Lightbulb,
  star: Star,
  heart: Heart,
  flame: Flame,
  compass: Compass,
  calculator: Calculator,
  gem: Gem,
  target: Target,
  infinity: Infinity,
};

export function isProfileAvatarId(value: string): value is ProfileAvatarId {
  return (PROFILE_AVATAR_IDS as readonly string[]).includes(value);
}

export function resolveProfileAvatarId(value: string | null | undefined): ProfileAvatarId {
  if (value && isProfileAvatarId(value)) {
    return value;
  }
  return "user-circle";
}

export function getProfileAvatarIcon(id: ProfileAvatarId): LucideIcon {
  return ICON_MAP[id];
}

type ProfileAvatarIconProps = {
  id: string | null | undefined;
  className?: string;
};

/** Renders the Lucide icon for a stored profile avatar id (falls back to user-circle). */
export function ProfileAvatarIcon({ id, className }: ProfileAvatarIconProps) {
  const resolved = resolveProfileAvatarId(id);
  const Icon = ICON_MAP[resolved];
  return <Icon className={className} aria-hidden />;
}
