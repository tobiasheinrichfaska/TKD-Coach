import { seedStarterGroup, STARTER_ATHLETE_ID, STARTER_GROUP_ID } from '../starter';
import { migrate } from '../migration';
import { AppData } from '../../types';

const fresh = (): AppData => migrate({} as AppData);

describe('seedStarterGroup', () => {
  it('adds the Beispielgruppe + Max Mustermann athlete to a fresh install', () => {
    const out = seedStarterGroup(fresh());
    const max = out.persons.find(p => p.id === STARTER_ATHLETE_ID);
    const group = out.groups.find(g => g.id === STARTER_GROUP_ID);
    expect(max?.name).toBe('Max Mustermann');
    expect(max?.athlete?.belt).toBe('kup-10');
    expect(group?.name).toBe('Beispielgruppe');
    // The group must reference the athlete, so a session can be planned right away.
    expect(group?.athleteIds).toContain(STARTER_ATHLETE_ID);
    expect(group?.trainingTimes.length).toBeGreaterThan(0);
  });

  it('is idempotent — re-running never duplicates', () => {
    const once = seedStarterGroup(fresh());
    const twice = seedStarterGroup(once);
    expect(twice.persons.filter(p => p.id === STARTER_ATHLETE_ID)).toHaveLength(1);
    expect(twice.groups.filter(g => g.id === STARTER_GROUP_ID)).toHaveLength(1);
  });

  it('does not touch existing user data and only restores a missing half', () => {
    const base = fresh();
    // User kept the athlete but deleted the example group: only the group is restored.
    const withAthleteOnly: AppData = { ...base, persons: [...base.persons, { id: STARTER_ATHLETE_ID, name: 'Max Mustermann', phones: [], isCoach: false }] };
    const out = seedStarterGroup(withAthleteOnly);
    expect(out.persons.filter(p => p.id === STARTER_ATHLETE_ID)).toHaveLength(1);
    expect(out.groups.filter(g => g.id === STARTER_GROUP_ID)).toHaveLength(1);
  });
});
