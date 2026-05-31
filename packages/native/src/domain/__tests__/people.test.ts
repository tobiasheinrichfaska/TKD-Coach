import {
  toAthleteView, athleteViews, coaches, personName,
  athletesInGroup, groupsForAthlete, ungroupedAthletes,
  contactsForAthlete, guardiansForAthlete, athletesForContact,
} from '../people';
import { Person, Group, ContactLink } from '../../types';

const athlete = (id: string, name = id): Person => ({
  id, name, phones: [], isCoach: false,
  athlete: { belt: 'kup-10', neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] },
});
const plain = (id: string, name = id, isCoach = false): Person => ({ id, name, phones: ['123'], isCoach });
const grp = (id: string, athleteIds: string[]): Group => ({ id, name: id, trainingTimes: [], athleteIds });

describe('athlete role view', () => {
  it('toAthleteView flattens person + profile, null for non-athletes', () => {
    const v = toAthleteView(athlete('a1', 'Mia'));
    expect(v).toMatchObject({ id: 'a1', name: 'Mia', belt: 'kup-10' });
    expect(toAthleteView(plain('c1'))).toBeNull();
    expect(toAthleteView(undefined)).toBeNull();
  });

  it('athleteViews lists only persons holding the athlete role', () => {
    const persons = [athlete('a1'), plain('c1'), athlete('a2')];
    expect(athleteViews(persons).map(a => a.id)).toEqual(['a1', 'a2']);
  });

  it('coaches / personName', () => {
    const persons = [plain('c1', 'Coach', true), athlete('a1', 'Mia')];
    expect(coaches(persons).map(p => p.id)).toEqual(['c1']);
    expect(personName(persons, 'a1')).toBe('Mia');
    expect(personName(persons, 'zzz')).toBe('Unknown');
  });
});

describe('group membership (M:N)', () => {
  const persons = [athlete('a1'), athlete('a2'), athlete('a3'), plain('c1')];
  const groups = [grp('g1', ['a2', 'a1']), grp('g2', ['a1'])]; // a1 in both, a3 in none

  it('athletesInGroup returns members in stored order, skipping missing/non-athletes', () => {
    expect(athletesInGroup(persons, groups[0]).map(a => a.id)).toEqual(['a2', 'a1']);
    expect(athletesInGroup(persons, undefined)).toEqual([]);
    expect(athletesInGroup(persons, grp('gx', ['a1', 'c1', 'ghost'])).map(a => a.id)).toEqual(['a1']);
  });

  it('groupsForAthlete + ungroupedAthletes', () => {
    expect(groupsForAthlete(groups, 'a1').map(g => g.id)).toEqual(['g1', 'g2']);
    expect(ungroupedAthletes(persons, groups).map(a => a.id)).toEqual(['a3']);
  });
});

describe('emergency contacts via contactLinks', () => {
  const persons = [athlete('a1'), athlete('a2'), plain('mum', 'Mum'), plain('nb', 'Neighbour')];
  const links: ContactLink[] = [
    { id: 'l1', contactId: 'mum', athleteId: 'a1', guardian: true },
    { id: 'l2', contactId: 'mum', athleteId: 'a2', guardian: true },
    { id: 'l3', contactId: 'nb', athleteId: 'a1', guardian: false }, // neighbour: contact only
  ];

  it('contactsForAthlete resolves person + per-edge guardian flag', () => {
    const cs = contactsForAthlete(persons, links, 'a1');
    expect(cs.map(c => c.person.name)).toEqual(['Mum', 'Neighbour']);
    expect(cs.map(c => c.guardian)).toEqual([true, false]);
  });

  it('guardiansForAthlete filters to guardians', () => {
    expect(guardiansForAthlete(persons, links, 'a1').map(c => c.person.id)).toEqual(['mum']);
  });

  it('athletesForContact lists the athletes a contact covers', () => {
    expect(athletesForContact(persons, links, 'mum').map(p => p.id)).toEqual(['a1', 'a2']);
  });
});
