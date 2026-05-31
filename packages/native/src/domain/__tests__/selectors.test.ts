import {
  planStatus,
  sessionTotals,
  todaysPlans,
  coverageByTechnique,
  coverageByBodyPart,
  assessmentHistory,
  athletesInGroup,
  groupsForAthlete,
  ungroupedAthletes,
} from '../selectors';
import { GameDefinition, SessionLog, SessionPlan, Assessment, Athlete, Group } from '../../types';

const game = (id: string, min: number, techniques: string[], bodyParts: string[]): GameDefinition => ({
  id, name: id, shortName: id, phase: 'main', defaultMinutes: min, ageGroup: 'all', isBuiltIn: true,
  neuroTarget: 'x', techniques, bodyParts,
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

describe('group membership (M:N)', () => {
  const mkAth = (id: string): Athlete => ({
    id, name: id, belt: 'kup-10',
    neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [],
  });
  const mkGrp = (id: string, athleteIds: string[]): Group => ({ id, name: id, ageCategory: 'kids', athleteIds });
  const athletes = [mkAth('a1'), mkAth('a2'), mkAth('a3')];
  const groups = [mkGrp('g1', ['a2', 'a1']), mkGrp('g2', ['a1'])]; // a1 in both, a3 in none

  it('athletesInGroup returns members in stored order, skipping missing ids', () => {
    expect(athletesInGroup(athletes, groups[0]).map(a => a.id)).toEqual(['a2', 'a1']);
    expect(athletesInGroup(athletes, undefined)).toEqual([]);
    expect(athletesInGroup(athletes, mkGrp('gx', ['a1', 'ghost'])).map(a => a.id)).toEqual(['a1']);
  });

  it('groupsForAthlete finds every group the athlete is in', () => {
    expect(groupsForAthlete(groups, 'a1').map(g => g.id)).toEqual(['g1', 'g2']);
    expect(groupsForAthlete(groups, 'a3')).toEqual([]);
  });

  it('ungroupedAthletes finds athletes in no group', () => {
    expect(ungroupedAthletes(athletes, groups).map(a => a.id)).toEqual(['a3']);
    expect(ungroupedAthletes(athletes, []).map(a => a.id)).toEqual(['a1', 'a2', 'a3']);
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
