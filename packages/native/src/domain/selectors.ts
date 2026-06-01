import { SessionLog, SessionPlan, GameDefinition, Assessment } from '../types';

export type PlanStatus = 'done' | 'running' | 'to-start';

/** A plan is done once it has a completed log; running if it has a running log; else to-start. */
export function planStatus(planId: string, logs: SessionLog[]): PlanStatus {
  if (logs.some(l => l.planId === planId && l.status === 'completed')) return 'done';
  if (logs.some(l => l.planId === planId && l.status === 'running')) return 'running';
  return 'to-start';
}

/** The running log for a plan, if any (there should be at most one). */
export function runningLogForPlan(logs: SessionLog[], planId: string): SessionLog | undefined {
  return logs.find(l => l.planId === planId && l.status === 'running');
}

export interface PartitionedPlans {
  /** Plans with a running log (and not yet completed) — resume or discard. */
  inProgress: SessionPlan[];
  /** Plans not started and not completed — start or edit. */
  planned: SessionPlan[];
}

/**
 * Split plans by their live status into in-progress vs planned (completed plans are
 * excluded — they live in the recent/completed list). Both lists are sorted by date.
 * Pure: the screen renders straight from this, embedding no status rules of its own.
 */
export function partitionPlans(plans: SessionPlan[], logs: SessionLog[]): PartitionedPlans {
  const inProgress: SessionPlan[] = [];
  const planned: SessionPlan[] = [];
  for (const p of plans) {
    const st = planStatus(p.id, logs);
    if (st === 'done') continue;
    (st === 'running' ? inProgress : planned).push(p);
  }
  const byDate = (a: SessionPlan, b: SessionPlan) =>
    new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
  return { inProgress: [...inProgress].sort(byDate), planned: [...planned].sort(byDate) };
}

/** Completed, non-archived logs, newest first. `limit` undefined = all. */
export function recentCompletedLogs(logs: SessionLog[], limit?: number): SessionLog[] {
  const sorted = logs
    .filter(l => l.status === 'completed' && !l.archived)
    .sort((a, b) => new Date(b.endedAt || b.startedAt).getTime() - new Date(a.endedAt || a.startedAt).getTime());
  return limit == null ? sorted : sorted.slice(0, limit);
}

/** Archived logs, newest first. */
export function archivedLogs(logs: SessionLog[]): SessionLog[] {
  return logs
    .filter(l => l.archived)
    .sort((a, b) => new Date(b.endedAt || b.startedAt).getTime() - new Date(a.endedAt || a.startedAt).getTime());
}

/** Sum of planned minutes for a list of game ids. */
export function plannedMinutes(gameIds: string[], games: GameDefinition[]): number {
  const byId = new Map(games.map(g => [g.id, g]));
  return gameIds.reduce((s, id) => s + (byId.get(id)?.defaultMinutes || 0), 0);
}

/** Summed actual drill seconds of a session. */
export function actualSeconds(log: SessionLog): number {
  return log.gameLogs.reduce((s, gl) => s + (gl.durationSeconds || 0), 0);
}

/** Number of drills actually played (have a duration). */
export function playedCount(log: SessionLog): number {
  return log.gameLogs.filter(gl => gl.durationSeconds != null).length;
}

/** Session length in seconds: summed drill time, or wall-clock if no drills were timed. */
export function sessionDurationSec(log: SessionLog): number {
  const drill = actualSeconds(log);
  if (drill > 0) return drill;
  return log.endedAt ? Math.max(0, Math.round((Date.parse(log.endedAt) - Date.parse(log.startedAt)) / 1000)) : 0;
}

/** Sessions an athlete was rostered for (attendance recorded), newest first. */
export function athleteSessions(logs: SessionLog[], athleteId: string): SessionLog[] {
  return logs
    .filter(l => l.attendance?.some(a => a.athleteId === athleteId))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

/**
 * Clean up running logs (data hygiene, applied on load):
 *  - drop a running log if its plan also has a completed log (the run finished);
 *  - keep only the NEWEST running log per plan (collapses accidental duplicates).
 * All non-running logs are preserved untouched. Pure + unit-tested.
 */
export function reconcileRunningLogs(logs: SessionLog[]): SessionLog[] {
  const completedPlanIds = new Set(logs.filter(l => l.status === 'completed').map(l => l.planId));
  const newestRunningByPlan = new Map<string, SessionLog>();
  for (const l of logs) {
    if (l.status !== 'running' || completedPlanIds.has(l.planId)) continue;
    const cur = newestRunningByPlan.get(l.planId);
    if (!cur || new Date(l.startedAt).getTime() > new Date(cur.startedAt).getTime()) {
      newestRunningByPlan.set(l.planId, l);
    }
  }
  const keep = new Set([...newestRunningByPlan.values()].map(l => l.id));
  return logs.filter(l => l.status !== 'running' || keep.has(l.id));
}

export interface SessionTotals {
  plannedSec: number;
  actualSec: number;
  playedCount: number;
  totalCount: number;
}

export function sessionTotals(log: SessionLog, games: GameDefinition[]): SessionTotals {
  const byId = new Map(games.map(g => [g.id, g]));
  return {
    plannedSec: log.gameLogs.reduce((s, gl) => s + (byId.get(gl.gameId)?.defaultMinutes || 0) * 60, 0),
    actualSec: log.gameLogs.reduce((s, gl) => s + (gl.durationSeconds || 0), 0),
    playedCount: log.gameLogs.filter(gl => gl.durationSeconds != null).length,
    totalCount: log.gameLogs.length,
  };
}

export function todaysPlans(plans: SessionPlan[], todayISO: string): SessionPlan[] {
  return plans.filter(p => p.plannedDate === todayISO);
}

export interface Coverage {
  id: string;
  /** distinct completed sessions that trained this id */
  sessions: number;
  /** total seconds spent on games tagged with this id */
  seconds: number;
}

function coverage(
  logs: SessionLog[],
  games: GameDefinition[],
  pick: (g: GameDefinition) => string[] | undefined
): Coverage[] {
  const byId = new Map(games.map(g => [g.id, g]));
  const acc = new Map<string, { sessions: Set<string>; seconds: number }>();
  for (const log of logs) {
    if (log.status !== 'completed') continue;
    for (const gl of log.gameLogs) {
      const g = byId.get(gl.gameId);
      if (!g) continue;
      const sec = gl.durationSeconds || 0;
      for (const id of pick(g) || []) {
        const e = acc.get(id) || { sessions: new Set<string>(), seconds: 0 };
        e.sessions.add(log.id);
        e.seconds += sec;
        acc.set(id, e);
      }
    }
  }
  return [...acc.entries()]
    .map(([id, e]) => ({ id, sessions: e.sessions.size, seconds: e.seconds }))
    .sort((a, b) => b.seconds - a.seconds || a.id.localeCompare(b.id));
}

/** How much each technique was trained across completed sessions (recency/heatmap source). */
export const coverageByTechnique = (logs: SessionLog[], games: GameDefinition[]): Coverage[] =>
  coverage(logs, games, g => g.techniques);

/** How much each body part was loaded across completed sessions. */
export const coverageByBodyPart = (logs: SessionLog[], games: GameDefinition[]): Coverage[] =>
  coverage(logs, games, g => g.bodyParts);

/** An athlete's assessments for one game, oldest → newest (for delta/progress). */
export function assessmentHistory(
  assessments: Assessment[],
  athleteId: string,
  gameId: string
): Assessment[] {
  return assessments
    .filter(a => a.athleteId === athleteId && a.gameId === gameId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
