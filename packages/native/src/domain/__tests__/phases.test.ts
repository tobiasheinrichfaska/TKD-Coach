import { primaryPhase, gameInPhase, phaseBand } from '../phases';
import { GameDefinition } from '../../types';

const game = (sessionPhases: GameDefinition['sessionPhases']): GameDefinition => ({
  id: 'g', name: 'g', shortName: 'g', sessionPhases, defaultMinutes: 5, ageGroup: 'all', isBuiltIn: true,
});

describe('phase helpers', () => {
  it('primaryPhase = lowest eligible phase; 3 when missing', () => {
    expect(primaryPhase(game([4, 2]))).toBe(2);
    expect(primaryPhase(game([5]))).toBe(5);
    expect(primaryPhase(undefined)).toBe(3);
    expect(primaryPhase(game([]))).toBe(3);
  });

  it('gameInPhase tests eligibility', () => {
    const g = game([1, 4]);
    expect(gameInPhase(g, 1)).toBe(true);
    expect(gameInPhase(g, 4)).toBe(true);
    expect(gameInPhase(g, 3)).toBe(false);
  });

  it('phaseBand: 1–2 warmup, 3 main, 4–5 cooldown', () => {
    expect([1, 2].map(p => phaseBand(p as 1 | 2))).toEqual(['warmup', 'warmup']);
    expect(phaseBand(3)).toBe('main');
    expect([4, 5].map(p => phaseBand(p as 4 | 5))).toEqual(['cooldown', 'cooldown']);
  });
});
