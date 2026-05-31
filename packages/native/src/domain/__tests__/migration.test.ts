import { migrate } from '../migration';
import { BUILTIN_GAMES } from '../../constants/games';
import { BUILTIN_TEMPLATES } from '../templates';
import { AppData, GameDefinition, SessionTemplate } from '../../types';

const base = (games: GameDefinition[]): AppData => ({
  version: 1, games, persons: [], groups: [], sessionPlans: [], sessionLogs: [], assessments: [],
  sessionTemplates: [], contactLinks: [],
});

describe('migrate', () => {
  it('adds all built-in Übungen from an empty seed', () => {
    const out = migrate(base([]));
    expect(out.games.length).toBe(BUILTIN_GAMES.length);
    for (const b of BUILTIN_GAMES) expect(out.games.some(g => g.id === b.id)).toBe(true);
  });

  it('refreshes a stale built-in copy from the canonical seed', () => {
    const stale: GameDefinition = { ...BUILTIN_GAMES[0], name: 'OLD NAME' };
    const out = migrate(base([stale]));
    expect(out.games.find(g => g.id === stale.id)?.name).toBe(BUILTIN_GAMES[0].name);
    expect(out.games.length).toBe(BUILTIN_GAMES.length);
  });

  it('preserves user-created games', () => {
    const custom: GameDefinition = {
      id: 'custom-1', name: 'Custom', shortName: 'C', phase: 'main',
      defaultMinutes: 5, ageGroup: 'all', isBuiltIn: false, neuroTarget: 'x',
    };
    const out = migrate(base([custom]));
    expect(out.games.some(g => g.id === 'custom-1')).toBe(true);
    expect(out.games.length).toBe(BUILTIN_GAMES.length + 1);
  });

  it('handles a missing games array', () => {
    const out = migrate({ ...base([]), games: undefined as unknown as GameDefinition[] });
    expect(out.games.length).toBe(BUILTIN_GAMES.length);
  });

  it('leaves non-game data untouched', () => {
    const d = base([]);
    d.groups = [{ id: 'g', name: 'G', ageCategory: 'kids', athleteIds: [] }];
    expect(migrate(d).groups).toEqual(d.groups);
  });

  it('seeds built-in session templates from an empty seed', () => {
    const out = migrate(base([]));
    expect(out.sessionTemplates.length).toBe(BUILTIN_TEMPLATES.length);
    for (const b of BUILTIN_TEMPLATES) expect(out.sessionTemplates.some(t => t.id === b.id)).toBe(true);
  });

  it('refreshes a stale built-in template and preserves user templates', () => {
    const stale: SessionTemplate = { ...BUILTIN_TEMPLATES[0], name: 'OLD' };
    const custom: SessionTemplate = {
      id: 'tmpl-custom', name: 'My Template', ageGroup: 'all', itemIds: ['W1'], isBuiltIn: false,
    };
    const out = migrate({ ...base([]), sessionTemplates: [stale, custom] });
    expect(out.sessionTemplates.find(t => t.id === stale.id)?.name).toBe(BUILTIN_TEMPLATES[0].name);
    expect(out.sessionTemplates.some(t => t.id === 'tmpl-custom')).toBe(true);
    expect(out.sessionTemplates.length).toBe(BUILTIN_TEMPLATES.length + 1);
  });

  it('handles a missing sessionTemplates array', () => {
    const out = migrate({ ...base([]), sessionTemplates: undefined as unknown as SessionTemplate[] });
    expect(out.sessionTemplates.length).toBe(BUILTIN_TEMPLATES.length);
  });

  // Real legacy data has athletes/emergencyContacts and NO persons/contactLinks keys.
  const legacy = (extra: Record<string, unknown>): AppData => ({
    version: 1, games: [], groups: [], sessionPlans: [], sessionLogs: [], assessments: [],
    sessionTemplates: [], ...extra,
  } as unknown as AppData);

  it('converts legacy athletes → persons (keeping id) and normalises belts', () => {
    const legacyAthlete = (id: string, belt: string) => ({
      id, name: id, belt, birthYear: 2014,
      contact: { phone: '0151', email: 'a@x.de' },
      neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [],
    });
    const out = migrate(legacy({ athletes: [legacyAthlete('a1', 'white'), legacyAthlete('a2', 'dan-3')] }));
    expect(out.persons.map(p => p.id)).toEqual(['a1', 'a2']); // ids preserved
    expect(out.persons[0].athlete?.belt).toBe('kup-10');      // white -> 10. Kup
    expect(out.persons[1].athlete?.belt).toBe('dan-3');       // ladder id untouched
    expect(out.persons[0].phones).toEqual(['0151']);          // athlete's own phone
    expect(out.persons[0].email).toBe('a@x.de');
  });

  it('converts legacy emergencyContacts → contact persons + contactLinks', () => {
    const out = migrate(legacy({
      emergencyContacts: [
        { id: 'mum', name: 'Mum', email: 'm@x.de', phones: ['1', '2'], isGuardian: true, athleteIds: ['a1', 'a2'] },
      ],
    }));
    expect(out.persons.find(p => p.id === 'mum')?.phones).toEqual(['1', '2']);
    expect(out.contactLinks).toHaveLength(2);
    expect(out.contactLinks.every(l => l.contactId === 'mum' && l.guardian === true)).toBe(true);
    expect(out.contactLinks.map(l => l.athleteId)).toEqual(['a1', 'a2']);
  });

  it('is idempotent on already-migrated data (persons present, belts re-normalised)', () => {
    const migrated: AppData = {
      ...base([]),
      persons: [{ id: 'a1', name: 'A', phones: [], isCoach: false, athlete: { belt: 'dan-2', neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] } }],
    };
    const out = migrate(migrated);
    expect(out.persons).toHaveLength(1);
    expect(out.persons[0].athlete?.belt).toBe('dan-2');
  });
});
