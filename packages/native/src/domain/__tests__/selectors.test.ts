import {
  planStatus,
  sessionTotals,
  todaysPlans,
  coverageByTechnique,
  coverageByBodyPart,
  assessmentHistory,
  partitionPlans,
  runningLogForPlan,
  recentCompletedLogs,
  archivedLogs,
  plannedMinutes,
  actualSeconds,
  playedCount,
  sessionDurationSec,
  athleteSessions,
} from '../selectors';
import { GameDefinition, SessionLog, SessionPlan, Assessment } from '../../types';

const game = (id: string, min: number, techniques: string[], bodyParts: string[]): GameDefinition => ({
  id, name: id, shortName: id, sessionPhases: [3], defaultMinutes: min, ageGroup: 'all', isBuiltIn: true,
  techniques, bodyParts,
});
const games: GameDefinition[] = [
  game('A', 10, ['ap-chagi'], ['hip', 'knee']),
  game('B', 5, ['ap-chagi', 'dollyo-chagi'], ['hip']),
];
const log = (id: string, planId: string, status: SessionLog['status'], gl: { gameId: string; sec?: number }[]): SessionLog => ({
  id, planId, groupId: 'g', startedAt: '2026-06-01T10:00:00Z', status,
  gameLogs: gl.map(x => ({ gameId: x.gameId, durationSeconds: x.sec })),
});

describe('planStatus', () => {
  const logs = [log('l1', 'p-run', 'running', []), log('l2', 'p-done', 'completed', [])];
  it('done / running / to-start', () => {
    expect(planStatus('p-done', logs)).toBe('done');
    expect(planStatus('p-run', logs)).toBe('running');
    expect(planStatus('p-new', logs)).toBe('to-start');
  });
});

describe('partitionPlans / runningLogForPlan / recentCompletedLogs', () => {
  const mkPlan = (id: string, plannedDate: string): SessionPlan => ({
    id, groupId: 'g', name: id, plannedDate, template: 'custom', plannedGames: [], createdAt: plannedDate,
  });
  const mkLog = (id: string, planId: string, status: SessionLog['status'], startedAt = '2026-06-01T10:00:00.000Z'): SessionLog => ({
    id, planId, groupId: 'g', startedAt, gameLogs: [], status,
  });
  const plans = [mkPlan('p1', '2026-06-03'), mkPlan('p2', '2026-06-01'), mkPlan('p3', '2026-06-02')];

  it('running → in-progress, completed → excluded, else planned (date-sorted)', () => {
    const logs = [mkLog('l1', 'p1', 'running'), mkLog('l2', 'p2', 'completed')];
    const { inProgress, planned } = partitionPlans(plans, logs);
    expect(inProgress.map(p => p.id)).toEqual(['p1']);
    expect(planned.map(p => p.id)).toEqual(['p3']);
  });

  it('completed wins over a stray running log for the same plan', () => {
    const logs = [mkLog('r', 'p1', 'running'), mkLog('c', 'p1', 'completed')];
    const { inProgress, planned } = partitionPlans(plans, logs);
    expect(inProgress).toHaveLength(0);
    expect(planned.map(p => p.id)).not.toContain('p1');
  });

  it('runningLogForPlan finds the running log only', () => {
    const logs = [mkLog('l1', 'p1', 'running'), mkLog('l2', 'p2', 'completed')];
    expect(runningLogForPlan(logs, 'p1')?.id).toBe('l1');
    expect(runningLogForPlan(logs, 'p2')).toBeUndefined();
  });

  it('recentCompletedLogs: completed + non-archived, newest first, capped', () => {
    const logs: SessionLog[] = [
      mkLog('a', 'p1', 'completed', '2026-06-01T10:00:00.000Z'),
      mkLog('b', 'p2', 'completed', '2026-06-03T10:00:00.000Z'),
      { ...mkLog('c', 'p3', 'completed', '2026-06-02T10:00:00.000Z'), archived: true },
      mkLog('d', 'p1', 'running'),
    ];
    expect(recentCompletedLogs(logs).map(l => l.id)).toEqual(['b', 'a']);
    expect(recentCompletedLogs(logs, 1).map(l => l.id)).toEqual(['b']);
  });
});

describe('session aggregation helpers', () => {
  it('plannedMinutes sums defaultMinutes for ids', () => {
    expect(plannedMinutes(['A', 'B', 'missing'], games)).toBe(15); // 10 + 5 + 0
  });
  it('actualSeconds + playedCount over a log', () => {
    const l = log('l', 'p', 'completed', [{ gameId: 'A', sec: 540 }, { gameId: 'B' }]);
    expect(actualSeconds(l)).toBe(540);
    expect(playedCount(l)).toBe(1);
  });
  it('sessionDurationSec uses drill time, else wall-clock', () => {
    const drilled = log('l', 'p', 'completed', [{ gameId: 'A', sec: 300 }]);
    expect(sessionDurationSec(drilled)).toBe(300);
    const untimed: SessionLog = {
      id: 'l', planId: 'p', groupId: 'g', status: 'completed',
      startedAt: '2026-06-01T10:00:00.000Z', endedAt: '2026-06-01T10:05:00.000Z', gameLogs: [],
    };
    expect(sessionDurationSec(untimed)).toBe(300);
  });
  it('archivedLogs filters + sorts newest first', () => {
    const logs: SessionLog[] = [
      { ...log('a', 'p', 'completed', []), archived: true, startedAt: '2026-06-01T10:00:00Z' },
      { ...log('b', 'p', 'completed', []), archived: true, startedAt: '2026-06-03T10:00:00Z' },
      log('c', 'p', 'completed', []),
    ];
    expect(archivedLogs(logs).map(l => l.id)).toEqual(['b', 'a']);
  });
  it('athleteSessions: rostered logs, newest first', () => {
    const logs: SessionLog[] = [
      { ...log('a', 'p', 'completed', []), startedAt: '2026-06-01T10:00:00Z', attendance: [{ athleteId: 'x', present: true }] },
      { ...log('b', 'p', 'completed', []), startedAt: '2026-06-03T10:00:00Z', attendance: [{ athleteId: 'x', present: false }] },
      { ...log('c', 'p', 'completed', []), attendance: [{ athleteId: 'y', present: true }] },
    ];
    expect(athleteSessions(logs, 'x').map(l => l.id)).toEqual(['b', 'a']);
    expect(athleteSessions(logs, 'y').map(l => l.id)).toEqual(['c']);
  });
});

describe('sessionTotals', () => {
  it('sums planned vs actual and counts played', () => {
    const l = log('l', 'p', 'completed', [{ gameId: 'A', sec: 540 }, { gameId: 'B' }]);
    expect(sessionTotals(l, games)).toEqual({ plannedSec: 900, actualSec: 540, playedCount: 1, totalCount: 2 });
  });
});

describe('todaysPlans', () => {
  it('filters by plannedDate', () => {
    const plans = [{ plannedDate: '2026-06-03' }, { plannedDate: '2026-06-04' }] as SessionPlan[];
    expect(todaysPlans(plans, '2026-06-03')).toHaveLength(1);
  });
});

describe('coverage', () => {
  const logs = [
    log('l1', 'p', 'completed', [{ gameId: 'A', sec: 100 }, { gameId: 'B', sec: 50 }]),
    log('l2', 'p', 'completed', [{ gameId: 'A', sec: 200 }]),
    log('l3', 'p', 'running', [{ gameId: 'A', sec: 999 }]), // ignored (not completed)
  ];
  it('aggregates technique seconds + distinct sessions, sorted by seconds', () => {
    const cov = coverageByTechnique(logs, games);
    const ap = cov.find(c => c.id === 'ap-chagi')!;
    const dollyo = cov.find(c => c.id === 'dollyo-chagi')!;
    expect(ap).toEqual({ id: 'ap-chagi', sessions: 2, seconds: 350 }); // A(100+200)+B(50)
    expect(dollyo).toEqual({ id: 'dollyo-chagi', sessions: 1, seconds: 50 });
    expect(cov[0].id).toBe('ap-chagi'); // sorted desc by seconds
  });
  it('aggregates body parts', () => {
    const cov = coverageByBodyPart(logs, games);
    expect(cov.find(c => c.id === 'hip')).toEqual({ id: 'hip', sessions: 2, seconds: 350 });
    expect(cov.find(c => c.id === 'knee')).toEqual({ id: 'knee', sessions: 2, seconds: 300 });
  });
});

describe('assessmentHistory', () => {
  it('filters by athlete+game, oldest first', () => {
    const a = (id: string, athleteId: string, gameId: string, date: string): Assessment => ({
      id, athleteId, gameId, date, metric: { type: 'balance_hold', dominant: 1, nonDominant: 1 },
    });
    const list = [a('2', 'x', 'C1', '2026-06-02'), a('1', 'x', 'C1', '2026-06-01'), a('3', 'y', 'C1', '2026-06-03')];
    const h = assessmentHistory(list, 'x', 'C1');
    expect(h.map(x => x.id)).toEqual(['1', '2']);
  });
});
