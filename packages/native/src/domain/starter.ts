import { AppData, Person, Group } from '../types';

// Starter records seeded ONCE on a truly fresh install (no stored data), so the app is
// usable out of the box — a session needs a group, so we ship one example group with one
// example athlete. Seeded only by the fresh-install path in DataContext (NOT by migrate's
// "when empty" rule), so deleting them is permanent and they never reappear.
export const STARTER_ATHLETE_ID = 'starter-max-mustermann';
export const STARTER_GROUP_ID = 'starter-beispielgruppe';

const starterAthlete = (): Person => ({
  id: STARTER_ATHLETE_ID,
  name: 'Max Mustermann',
  phones: [],
  isCoach: false,
  athlete: {
    belt: 'kup-10',
    neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 },
    poomsae: [],
    techniques: [],
  },
});

const starterGroup = (): Group => ({
  id: STARTER_GROUP_ID,
  name: 'Beispielgruppe',
  trainingTimes: [{ weekday: 2, start: '17:00', durationMin: 90 }],
  athleteIds: [STARTER_ATHLETE_ID],
});

/**
 * Add the example group + athlete if (and only if) they are not already present.
 * Pure and idempotent — re-running never duplicates. Each record is added independently,
 * so a half-present state (e.g. the group was deleted) only restores what's missing.
 */
export function seedStarterGroup(data: AppData): AppData {
  const hasAthlete = data.persons.some(p => p.id === STARTER_ATHLETE_ID);
  const hasGroup = data.groups.some(g => g.id === STARTER_GROUP_ID);
  if (hasAthlete && hasGroup) return data;
  return {
    ...data,
    persons: hasAthlete ? data.persons : [...data.persons, starterAthlete()],
    groups: hasGroup ? data.groups : [...data.groups, starterGroup()],
  };
}
