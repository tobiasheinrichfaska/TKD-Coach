import { migrate } from '../migration';
import { BUILTIN_GAMES } from '../../constants/games';
import { AppData, GameDefinition } from '../../types';

const base = (games: GameDefinition[]): AppData => ({
  version: 1, games, athletes: [], groups: [], sessionPlans: [], sessionLogs: [], assessments: [],
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
});
