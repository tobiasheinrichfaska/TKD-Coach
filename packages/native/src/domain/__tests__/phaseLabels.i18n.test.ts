import { SESSION_PHASE_LABELS, SessionPhase } from '../../types';
import { de } from '../../i18n/de';

// Guards audit #1: phase headings are rendered via t(), so every English label
// must have a German translation in de.ts (and one that is actually translated).
describe('SESSION_PHASE_LABELS i18n', () => {
  const phases = Object.keys(SESSION_PHASE_LABELS).map(Number) as SessionPhase[];

  it('every phase label resolves to a German string', () => {
    for (const p of phases) {
      const en = SESSION_PHASE_LABELS[p];
      expect(de[en]).toBeDefined();
      expect(typeof de[en]).toBe('string');
      expect(de[en].length).toBeGreaterThan(0);
    }
  });

  it('German labels differ from the English keys (Phase 5 · Meditation excepted — identical by language)', () => {
    for (const p of phases) {
      const en = SESSION_PHASE_LABELS[p];
      if (en === 'Phase 5 · Meditation') continue; // legitimately identical in DE
      expect(de[en]).not.toBe(en);
    }
  });
});
