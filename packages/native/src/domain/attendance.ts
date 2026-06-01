import type { AttendanceEntry } from '../types';

/**
 * Build the attendance list for a session run from the current roster.
 * Athletes default to ABSENT — the coach checks each one in as they arrive.
 * Any existing marks (e.g. when resuming a running session) are preserved;
 * athletes who left the roster are dropped, new ones added (absent).
 */
export function defaultAttendance(athleteIds: string[], existing?: AttendanceEntry[]): AttendanceEntry[] {
  const prev = new Map((existing ?? []).map(e => [e.athleteId, e.present]));
  return athleteIds.map(athleteId => ({ athleteId, present: prev.get(athleteId) ?? false }));
}

/** Toggle one athlete's present flag, returning a new list. */
export function toggleAttendance(att: AttendanceEntry[], athleteId: string): AttendanceEntry[] {
  return att.map(e => (e.athleteId === athleteId ? { ...e, present: !e.present } : e));
}

/** Number of athletes marked present. */
export function presentCount(att?: AttendanceEntry[]): number {
  return (att ?? []).filter(e => e.present).length;
}

/** Whether a specific athlete is marked present (defaults to true when unknown). */
export function isPresent(att: AttendanceEntry[] | undefined, athleteId: string): boolean {
  const e = (att ?? []).find(x => x.athleteId === athleteId);
  return e ? e.present : true;
}

/** Athlete ids marked absent. */
export function absentIds(att?: AttendanceEntry[]): string[] {
  return (att ?? []).filter(e => !e.present).map(e => e.athleteId);
}

/**
 * How often an athlete was present, across all session logs that recorded
 * attendance and listed this athlete. Sessions without an attendance roster,
 * or rosters that don't include the athlete, are not counted in the total.
 */
export function athleteAttendanceStats(
  logs: { attendance?: AttendanceEntry[] }[],
  athleteId: string,
): { present: number; total: number } {
  let present = 0;
  let total = 0;
  for (const log of logs) {
    const e = log.attendance?.find(a => a.athleteId === athleteId);
    if (!e) continue;
    total++;
    if (e.present) present++;
  }
  return { present, total };
}
