import { SessionLog, SessionPlan, GameDefinition, Assessment, Athlete, Group } from '../types';

// ===== Group membership (many-to-many; the link lives only on Group.athleteIds) =====

/** Athletes in a group, in the group's stored order. Missing ids are skipped. */
export function athletesInGroup(athletes: Athlete[], group: Group | undefined): Athlete[] {
  if (!group) return [];
  const byId = new Map(athletes.map(a => [a.id, a]));
  return group.athleteIds.map(id => byId.get(id)).filter((a): a is Athlete => a !== undefined);
}

/** Every group an athlete belongs to (may be several, or none). */
export function groupsForAthlete(groups: Group[], athleteId: string): Group[] {
  return groups.filter(g => g.athleteIds.includes(athleteId));
}

/** Athletes that belong to no group at all. */
export function ungroupedAthletes(athletes: Athlete[], groups: Group[]): Athlete[] {
  const claimed = new Set(groups.flatMap(g => g.athleteIds));
  return athletes.filter(a => !claimed.has(a.id));
}

export type PlanStatus = 'done' | 'running' | 'to-start';

/** A plan is done once it has a completed log; running if it has a running log; else to-start. */
export function planStatus(planId: string, logs: SessionLog[]): PlanStatus {
  if (logs.some(l => l.planId === planId && l.status === 'completed')) return 'done';
  if (logs.some(l => l.planId === planId && l.status === 'running')) return 'running';
  return 'to-start';
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
