/**
 * Mirrors Postgres `public.normalize_answer` in supabase/schema.sql:
 * regexp_replace(lower(trim(coalesce(raw_answer, ''))), '\s+', '', 'g')
 */
export function normalizeAnswer(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}
