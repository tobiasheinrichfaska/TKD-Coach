import { appReducer, EMPTY_STATE } from '../../context/reducer';
import { Group, Athlete, SessionLog, Assessment, SessionTemplate, AppData } from '../../types';

const grp = (id: string, athleteIds: string[] = []): Group => ({ id, name: id, ageCategory: 'kids', athleteIds });
const ath = (id: string, groupId: string): Athlete => ({
  id, name: id, belt: 'white', groupId,
  neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [],
});
const assess = (id: string, athleteId: string): Assessment => ({
  id, athleteId, gameId: 'C1', date: '2026-06-01', metric: { type: 'balance_hold', dominant: 1, nonDominant: 1 },
});

describe('appReducer', () => {
  it('adds groups and athletes', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1') });
    s = appReducer(s, { type: 'ADD_ATHLETE', payload: ath('a1', 'g1') });
    expect(s.groups).toHaveLength(1);
    expect(s.athletes).toHaveLength(1);
  });

  it('updates an athlete in place', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_ATHLETE', payload: ath('a1', 'g1') });
    s = appReducer(s, { type: 'UPDATE_ATHLETE', payload: { ...ath('a1', 'g1'), name: 'Renamed' } });
    expect(s.athletes[0].name).toBe('Renamed');
    expect(s.athletes).toHaveLength(1);
  });

  it('DELETE_GROUP cascades to its athletes', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1') });
    s = appReducer(s, { type: 'ADD_ATHLETE', payload: ath('a1', 'g1') });
    s = appReducer(s, { type: 'DELETE_GROUP', payload: { id: 'g1' } });
    expect(s.groups).toHaveLength(0);
    expect(s.athletes).toHaveLength(0);
  });

  it('DELETE_ATHLETE removes group membership + assessments', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1', ['a1']) });
    s = appReducer(s, { type: 'ADD_ATHLETE', payload: ath('a1', 'g1') });
    s = appReducer(s, { type: 'ADD_ASSESSMENT', payload: assess('as1', 'a1') });
    s = appReducer(s, { type: 'DELETE_ATHLETE', payload: { id: 'a1' } });
    expect(s.athletes).toHaveLength(0);
    expect(s.groups[0].athleteIds).toEqual([]);
    expect(s.assessments).toHaveLength(0);
  });

  it('adds, updates and deletes a session log', () => {
    const log: SessionLog = { id: 's1', planId: 'p', groupId: 'g', startedAt: '2026-06-01T10:00:00Z', status: 'running', gameLogs: [] };
    let s = appReducer(EMPTY_STATE, { type: 'ADD_SESSION_LOG', payload: log });
    expect(s.sessionLogs).toHaveLength(1);
    s = appReducer(s, { type: 'UPDATE_SESSION_LOG', payload: { ...log, status: 'completed' } });
    expect(s.sessionLogs[0].status).toBe('completed');
    s = appReducer(s, { type: 'DELETE_SESSION_LOG', payload: { id: 's1' } });
    expect(s.sessionLogs).toHaveLength(0);
  });

  it('LOAD_ALL replaces state and sets isLoaded', () => {
    const data: AppData = { version: 1, games: [], athletes: [], groups: [grp('g')], sessionPlans: [], sessionLogs: [], assessments: [], sessionTemplates: [] };
    const s = appReducer(EMPTY_STATE, { type: 'LOAD_ALL', payload: data });
    expect(s.isLoaded).toBe(true);
    expect(s.groups).toHaveLength(1);
  });

  it('adds, updates and deletes a session template', () => {
    const tmpl: SessionTemplate = { id: 't1', name: 'T', ageGroup: 'all', itemIds: ['W1'], isBuiltIn: false };
    let s = appReducer(EMPTY_STATE, { type: 'ADD_SESSION_TEMPLATE', payload: tmpl });
    expect(s.sessionTemplates).toHaveLength(1);
    s = appReducer(s, { type: 'UPDATE_SESSION_TEMPLATE', payload: { ...tmpl, name: 'Renamed', itemIds: ['W1', 'M1'] } });
    expect(s.sessionTemplates[0].name).toBe('Renamed');
    expect(s.sessionTemplates[0].itemIds).toEqual(['W1', 'M1']);
    expect(s.sessionTemplates).toHaveLength(1);
    s = appReducer(s, { type: 'DELETE_SESSION_TEMPLATE', payload: { id: 't1' } });
    expect(s.sessionTemplates).toHaveLength(0);
  });

  it('is immutable — does not mutate the previous state', () => {
    const s0 = EMPTY_STATE;
    const s1 = appReducer(s0, { type: 'ADD_GROUP', payload: grp('g1') });
    expect(s0.groups).toHaveLength(0);
    expect(s1).not.toBe(s0);
  });
});
