import { BUILTIN_TEMPLATES, getTemplate, templatesForAgeGroup } from '../templates';
import { BUILTIN_GAMES } from '../../constants/games';

describe('BUILTIN_TEMPLATES integrity', () => {
  const gameIds = new Set(BUILTIN_GAMES.map(g => g.id));

  it('every template item id resolves to a built-in Übung', () => {
    for (const t of BUILTIN_TEMPLATES) {
      for (const id of t.itemIds) {
        expect(gameIds.has(id)).toBe(true);
      }
    }
  });

  it('has unique, non-empty template ids and at least one item each', () => {
    const ids = BUILTIN_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of BUILTIN_TEMPLATES) {
      expect(t.id.length).toBeGreaterThan(0);
      expect(t.itemIds.length).toBeGreaterThan(0);
      expect(t.isBuiltIn).toBe(true);
    }
  });
});

describe('template helpers', () => {
  it('getTemplate finds by id', () => {
    expect(getTemplate(BUILTIN_TEMPLATES, 'kids-2h')?.ageGroup).toBe('kids');
    expect(getTemplate(BUILTIN_TEMPLATES, 'nope')).toBeUndefined();
  });

  it('templatesForAgeGroup includes "all" plus the matching group', () => {
    const forKids = templatesForAgeGroup(BUILTIN_TEMPLATES, 'kids');
    expect(forKids.some(t => t.id === 'kids-2h')).toBe(true);
    expect(forKids.some(t => t.id === 'mobility-warmup')).toBe(true); // ageGroup 'all'
    expect(forKids.some(t => t.id === 'youth-adult-1h30')).toBe(false);
  });
});
