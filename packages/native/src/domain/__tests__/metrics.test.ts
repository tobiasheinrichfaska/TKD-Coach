import { BUILTIN_METRIC_SCHEMAS, metricTypes, buildMetric, fieldDelta, getMetricSchema } from '../metrics';
import { BUILTIN_GAMES } from '../../constants/games';

const S = BUILTIN_METRIC_SCHEMAS;

describe('BUILTIN_METRIC_SCHEMAS', () => {
  it('covers the six known metric types', () => {
    expect(new Set(metricTypes(S))).toEqual(
      new Set(['balance_hold', 'reaction_errors', 'combo_accuracy', 'vestibular_landing', 'balance_poomsae', 'poomsae_distraction'])
    );
  });

  it('every schema has fields and a primaryField that is one of them', () => {
    for (const def of S) {
      expect(def.fields.length).toBeGreaterThan(0);
      expect(def.fields.map(f => f.key)).toContain(def.primaryField);
    }
  });

  it('every Übung logMetricType has a schema (data ↔ schema integrity)', () => {
    for (const g of BUILTIN_GAMES) {
      if (g.logMetricType) expect(getMetricSchema(S, g.logMetricType)).toBeDefined();
    }
  });
});

describe('buildMetric', () => {
  it('builds a typed metric when all fields are present', () => {
    expect(buildMetric(getMetricSchema(S, 'balance_hold'), { dominant: 12, nonDominant: 9 })).toEqual({
      type: 'balance_hold', dominant: 12, nonDominant: 9,
    });
  });

  it('returns null when a required field is missing or NaN', () => {
    expect(buildMetric(getMetricSchema(S, 'combo_accuracy'), { correct: 5 })).toBeNull(); // total missing
    expect(buildMetric(getMetricSchema(S, 'balance_hold'), { dominant: NaN, nonDominant: 9 })).toBeNull();
  });

  it('rounds integer fields', () => {
    expect(buildMetric(getMetricSchema(S, 'reaction_errors'), { errorsPerTen: 2.7 })).toEqual({ type: 'reaction_errors', errorsPerTen: 3 });
  });
});

describe('fieldDelta', () => {
  const higher = { key: 'dominant', label: 'Dominant' };
  const lower = { key: 'errorsPerTen', label: 'Errors', lowerIsBetter: true };

  it('returns null without a previous value', () => {
    expect(fieldDelta(higher, 10, undefined)).toBeNull();
  });

  it('higher-is-better: increase = improvement', () => {
    expect(fieldDelta(higher, 12, 10)).toEqual({ raw: 2, improved: true });
    expect(fieldDelta(higher, 8, 10)).toEqual({ raw: -2, improved: false });
  });

  it('lower-is-better: decrease = improvement', () => {
    expect(fieldDelta(lower, 2, 5)).toEqual({ raw: -3, improved: true });
    expect(fieldDelta(lower, 7, 5)).toEqual({ raw: 2, improved: false });
  });

  it('no change is not an improvement', () => {
    expect(fieldDelta(higher, 10, 10)).toEqual({ raw: 0, improved: false });
  });
});
