import type { AttendanceEntry } from '../types';

/**
 * Build the attendance list for a session run from the current roster.
 * Athletes default to present. Any existing marks (e.g. when resuming a running
 * session) are preserved; athletes who left the roster are dropped, new ones added.
 */
export function defaultAttendance(athleteIds: string[], existing?: AttendanceEntry[]): AttendanceEntry[] {
  const prev = new Map((existing ?? []).map(e => [e.athleteId, e.present]));
  return athleteIds.map(athleteId => ({ athleteId, present: prev.get(athleteId) ?? true }));
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
