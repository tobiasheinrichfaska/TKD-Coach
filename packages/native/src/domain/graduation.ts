import { Belt } from '../types';

/**
 * Age-aware graduation rules. We only know the birth *year*, so an athlete's age
 * is a 1-year range: minAge = refYear - birthYear - 1 (birthday not yet this year),
 * maxAge = refYear - birthYear (birthday already passed). Decisions therefore use
 * "definitely" bounds. With no birth year nothing is definite.
 *
 * Pure + UI-free; the screens call promote/demote/convert and render the result.
 */

// Promote/demote spine for the pre-black-belt grades.
const KUP_SPINE: Belt[] = [
  'none', 'kup-10', 'kup-9', 'kup-8', 'kup-7', 'kup-6', 'kup-5', 'kup-4', 'kup-3', 'kup-2', 'kup-1',
];

export interface AgeFacts {
  /** Max possible age ≤ 14 — i.e. definitely under 15 (== definitely 14 or below). */
  definitelyUnder15: boolean;
  /** Min possible age ≥ 14. */
  definitely14OrAbove: boolean;
  /** Min possible age ≥ 15. */
  definitely15OrAbove: boolean;
}

export function ageFacts(birthYear: number | undefined, refYear: number): AgeFacts {
  if (!birthYear) return { definitelyUnder15: false, definitely14OrAbove: false, definitely15OrAbove: false };
  const maxAge = refYear - birthYear;
  const minAge = refYear - birthYear - 1;
  return {
    definitelyUnder15: maxAge <= 14,
    definitely14OrAbove: minAge >= 14,
    definitely15OrAbove: minAge >= 15,
  };
}

const poomNum = (b: Belt): number | null => (b.startsWith('poom-') ? Number(b.slice(5)) : null);
const danNum = (b: Belt): number | null => (b.startsWith('dan-') ? Number(b.slice(4)) : null);

/** Next grade up, or null if none is available (ceiling or age-gated). */
export function promote(belt: Belt, birthYear: number | undefined, refYear: number): Belt | null {
  const facts = ageFacts(birthYear, refYear);

  const ki = KUP_SPINE.indexOf(belt);
  if (ki >= 0) {
    if (ki < KUP_SPINE.length - 1) return KUP_SPINE[ki + 1]; // none..2.Kup → next Kup
    // 1. Kup → first black-belt grade: Dan only when definitely 15+, otherwise Poom.
    return facts.definitely15OrAbove ? 'dan-1' : 'poom-1';
  }

  const p = poomNum(belt);
  if (p !== null) {
    // No Dan via promotion (use convertToDan). At definitely 15+, no further Poom either.
    if (facts.definitely15OrAbove) return null;
    return p < 3 ? (`poom-${p + 1}` as Belt) : null;
  }

  const d = danNum(belt);
  if (d !== null) return d < 9 ? (`dan-${d + 1}` as Belt) : null;

  return null;
}

/** Next grade down, or null at the bottom ("none"). */
export function demote(belt: Belt): Belt | null {
  const ki = KUP_SPINE.indexOf(belt);
  if (ki > 0) return KUP_SPINE[ki - 1];
  if (ki === 0) return null; // 'none'

  const p = poomNum(belt);
  if (p !== null) return p > 1 ? (`poom-${p - 1}` as Belt) : 'kup-1';

  const d = danNum(belt);
  if (d !== null) return d > 1 ? (`dan-${d - 1}` as Belt) : 'kup-1';

  return null;
}

/** A Poom may convert to the matching Dan once the athlete is definitely 14+. */
export function canConvertToDan(belt: Belt, birthYear: number | undefined, refYear: number): boolean {
  return poomNum(belt) !== null && ageFacts(birthYear, refYear).definitely14OrAbove;
}

/** Poom-N → Dan-N (null if not a Poom). */
export function convertToDan(belt: Belt): Belt | null {
  const p = poomNum(belt);
  return p !== null ? (`dan-${p}` as Belt) : null;
}
