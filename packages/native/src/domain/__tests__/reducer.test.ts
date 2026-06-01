import { appReducer, EMPTY_STATE } from '../../context/reducer';
import { Group, Person, SessionLog, Assessment, SessionTemplate, ContactLink, AppData } from '../../types';

const grp = (id: string, athleteIds: string[] = []): Group => ({ id, name: id, trainingTimes: [], athleteIds });
const athlete = (id: string): Person => ({
  id, name: id, phones: [], isCoach: false,
  athlete: { belt: 'kup-10', neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] },
});
const contact = (id: string): Person => ({ id, name: id, phones: ['123'], isCoach: false });
const assess = (id: string, athleteId: string): Assessment => ({
  id, athleteId, gameId: 'C1', date: '2026-06-01', metric: { type: 'balance_hold', dominant: 1, nonDominant: 1 },
});

describe('appReducer', () => {
  it('adds groups and persons', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1') });
    s = appReducer(s, { type: 'ADD_PERSON', payload: athlete('a1') });
    expect(s.groups).toHaveLength(1);
    expect(s.persons).toHaveLength(1);
  });

  it('updates a person in place', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_PERSON', payload: athlete('a1') });
    s = appReducer(s, { type: 'UPDATE_PERSON', payload: { ...athlete('a1'), name: 'Renamed', isCoach: true } });
    expect(s.persons[0].name).toBe('Renamed');
    expect(s.persons[0].isCoach).toBe(true);
    expect(s.persons).toHaveLength(1);
  });

  it('DELETE_GROUP removes only the group; persons persist (M:N membership)', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1', ['a1']) });
    s = appReducer(s, { type: 'ADD_PERSON', payload: athlete('a1') });
    s = appReducer(s, { type: 'DELETE_GROUP', payload: { id: 'g1' } });
    expect(s.groups).toHaveLength(0);
    expect(s.persons).toHaveLength(1);
  });

  it('DELETE_PERSON strips groups + contact edges (both sides) + assessments', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_GROUP', payload: grp('g1', ['a1']) });
    s = appReducer(s, { type: 'ADD_PERSON', payload: athlete('a1') });
    s = appReducer(s, { type: 'ADD_PERSON', payload: contact('c1') });
    // a1 is contacted by c1, and a1 is itself a contact for a sibling a2
    s = appReducer(s, { type: 'ADD_CONTACT_LINK', payload: { id: 'l1', contactId: 'c1', athleteId: 'a1', guardian: true } });
    s = appReducer(s, { type: 'ADD_CONTACT_LINK', payload: { id: 'l2', contactId: 'a1', athleteId: 'a2', guardian: false } });
    s = appReducer(s, { type: 'ADD_ASSESSMENT', payload: assess('as1', 'a1') });
    s = appReducer(s, { type: 'DELETE_PERSON', payload: { id: 'a1' } });
    expect(s.persons.map(p => p.id)).toEqual(['c1']);
    expect(s.groups[0].athleteIds).toEqual([]);
    expect(s.contactLinks).toHaveLength(0); // both edges naming a1 are gone
    expect(s.assessments).toHaveLength(0);
  });

  it('REMOVE_ATHLETE_ROLE keeps the person + their contact role, drops only athlete bits', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_PERSON', payload: athlete('a1') });
    s = appReducer(s, { type: 'ADD_GROUP', payload: grp('g1', ['a1']) });
    s = appReducer(s, { type: 'ADD_ASSESSMENT', payload: assess('as1', 'a1') });
    s = appReducer(s, { type: 'ADD_CONTACT_LINK', payload: { id: 'l-own', contactId: 'c1', athleteId: 'a1', guardian: true } });   // a1's own contact
    s = appReducer(s, { type: 'ADD_CONTACT_LINK', payload: { id: 'l-guard', contactId: 'a1', athleteId: 'a2', guardian: true } }); // a1 guards a sibling
    s = appReducer(s, { type: 'REMOVE_ATHLETE_ROLE', payload: { id: 'a1' } });
    const a1 = s.persons.find(p => p.id === 'a1');
    expect(a1).toBeDefined();                       // person is kept
    expect(a1?.athlete).toBeUndefined();            // athlete role removed
    expect(s.groups[0].athleteIds).toEqual([]);     // removed from groups
    expect(s.assessments).toHaveLength(0);          // own assessments deleted
    expect(s.contactLinks.map(l => l.id)).toEqual(['l-guard']); // own-contact edge dropped, guardian edge kept
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
    const data: AppData = { version: 1, games: [], persons: [], groups: [grp('g')], sessionPlans: [], sessionLogs: [], assessments: [], sessionTemplates: [], contactLinks: [], bodyParts: [], techniques: [], metricSchemas: [] };
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
    s = appReducer(s, { type: 'DELETE_SESSION_TEMPLATE', payload: { id: 't1' } });
    expect(s.sessionTemplates).toHaveLength(0);
  });

  it('adds, updates and deletes a contact link', () => {
    const l: ContactLink = { id: 'l1', contactId: 'c1', athleteId: 'a1', guardian: false };
    let s = appReducer(EMPTY_STATE, { type: 'ADD_CONTACT_LINK', payload: l });
    expect(s.contactLinks).toHaveLength(1);
    s = appReducer(s, { type: 'UPDATE_CONTACT_LINK', payload: { ...l, guardian: true } });
    expect(s.contactLinks[0].guardian).toBe(true);
    s = appReducer(s, { type: 'DELETE_CONTACT_LINK', payload: { id: 'l1' } });
    expect(s.contactLinks).toHaveLength(0);
  });

  it('catalog CRUD — body part (by id) + metric schema (by type)', () => {
    let s = appReducer(EMPTY_STATE, { type: 'ADD_BODY_PART', payload: { id: 'bp', name: 'BP', region: 'core', kind: 'muscle' } });
    s = appReducer(s, { type: 'ADD_TECHNIQUE', payload: { id: 'tk', name: 'TK', category: 'kick', bodyPartIds: ['bp'] } });
    s = appReducer(s, { type: 'ADD_METRIC_SCHEMA', payload: { type: 'm1', label: 'M', primaryField: 'a', fields: [{ key: 'a', label: 'A' }] } });
    expect([s.bodyParts.length, s.techniques.length, s.metricSchemas.length]).toEqual([1, 1, 1]);
    s = appReducer(s, { type: 'UPDATE_BODY_PART', payload: { id: 'bp', name: 'BP2', region: 'core', kind: 'muscle' } });
    expect(s.bodyParts[0].name).toBe('BP2');
    s = appReducer(s, { type: 'DELETE_BODY_PART', payload: { id: 'bp' } });
    s = appReducer(s, { type: 'DELETE_TECHNIQUE', payload: { id: 'tk' } });
    s = appReducer(s, { type: 'DELETE_METRIC_SCHEMA', payload: { type: 'm1' } });
    expect([s.bodyParts.length, s.techniques.length, s.metricSchemas.length]).toEqual([0, 0, 0]);
  });

  it('is immutable — does not mutate the previous state', () => {
    const s0 = EMPTY_STATE;
    const s1 = appReducer(s0, { type: 'ADD_GROUP', payload: grp('g1') });
    expect(s0.groups).toHaveLength(0);
    expect(s1).not.toBe(s0);
  });
});
