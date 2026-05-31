import { migrate } from '../migration';
import { BUILTIN_GAMES } from '../../constants/games';
import { BUILTIN_TEMPLATES } from '../templates';
import { AppData, GameDefinition, SessionTemplate, Athlete, Belt } from '../../types';

const base = (games: GameDefinition[]): AppData => ({
  version: 1, games, athletes: [], groups: [], sessionPlans: [], sessionLogs: [], assessments: [],
  sessionTemplates: [], emergencyContacts: [],
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

  it('normalises legacy colour-belt ids to ladder ids', () => {
    const mk = (belt: string): Athlete => ({
      id: belt, name: belt, belt: belt as Belt,
      neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [],
    });
    const out = migrate({ ...base([]), athletes: [mk('white'), mk('black'), mk('dan-3')] });
    expect(out.athletes[0].belt).toBe('kup-10'); // white -> 10. Kup
    expect(out.athletes[1].belt).toBe('dan-1');  // black -> 1. Dan
    expect(out.athletes[2].belt).toBe('dan-3');  // already a ladder id, untouched
  });
});
