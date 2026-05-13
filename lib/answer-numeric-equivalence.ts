import "server-only";

import { normalizeAnswer } from "@/lib/normalize-answer";

const EPS = 1e-9;

function isPlainDecimal(s: string): boolean {
  return /^-?(?:\d+\.\d+|\d+|\.\d+)$/.test(s);
}

/**
 * Parse a normalized (whitespace-stripped, lowercased) answer fragment as a real number.
 * Supports integers, decimals, simple fractions a/b, and trailing %.
 */
export function parseNormalizedNumeric(value: string): number | null {
  let s = value.trim().toLowerCase();
  if (!s) {
    return null;
  }

  if (s.endsWith("%")) {
    s = s.slice(0, -1).trim();
    const inner = parseNormalizedNumeric(s);
    if (inner === null) {
      return null;
    }
    return inner / 100;
  }

  const frac = /^(-?\d+)\/(-?\d+)$/.exec(s);
  if (frac) {
    const num = Number(frac[1]);
    const den = Number(frac[2]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
      return null;
    }
    return num / den;
  }

  if (!isPlainDecimal(s)) {
    return null;
  }

  const x = Number(s);
  return Number.isFinite(x) ? x : null;
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
}

/** True when both sides parse as numbers and agree within tolerance (after normalization). */
export function answersMatchNumerically(student: string, reference: string): boolean {
  const a = parseNormalizedNumeric(normalizeAnswer(student));
  const b = parseNormalizedNumeric(normalizeAnswer(reference));
  if (a === null || b === null) {
    return false;
  }
  return nearlyEqual(a, b);
}
