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

  it('ships the Tornadokick · Vestibulär-Fokus plan with its 6 new Phase-3 Übungen', () => {
    const tornado = getTemplate(BUILTIN_TEMPLATES, 'tornado-vestibular');
    expect(tornado?.ageGroup).toBe('youth-adults');
    // The progression M7..M12 must be present, in order, inside the plan.
    const progression = ['M7', 'M8', 'M9', 'M10', 'M11', 'M12'];
    expect(tornado!.itemIds.filter(id => progression.includes(id))).toEqual(progression);
    // Each new Übung exists, is Phase-3 main work, and only M12 logs a metric.
    for (const id of progression) {
      const g = BUILTIN_GAMES.find(x => x.id === id);
      expect(g?.sessionPhases).toEqual([3]);
    }
    expect(BUILTIN_GAMES.find(x => x.id === 'M12')?.logMetricType).toBe('vestibular_landing');
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
