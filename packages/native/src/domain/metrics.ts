import { AssessmentMetric, MetricFieldDef, MetricTypeDef } from '../types';

// Re-export the schema types (their canonical home is now types/index.ts so AppData can hold them).
export type { MetricFieldDef, MetricTypeDef } from '../types';

/**
 * Factory seed for the assessment-metric schemas. Stored editable in AppData.metricSchemas
 * (seed-once); the form, validation and progress delta/colour are generated from the schema —
 * no per-type UI code. The AssessmentMetric union in types stays the compile-time "known" set.
 */
export const BUILTIN_METRIC_SCHEMAS: MetricTypeDef[] = [
  {
    type: 'balance_hold', label: 'Balance-Halten', primaryField: 'dominant',
    fields: [
      { key: 'dominant', label: 'Dominantes Bein', unit: 's' },
      { key: 'nonDominant', label: 'Nicht-dominantes Bein', unit: 's' },
    ],
  },
  {
    type: 'reaction_errors', label: 'Reaktionsfehler', primaryField: 'errorsPerTen',
    fields: [{ key: 'errorsPerTen', label: 'Fehler pro 10 Reize', integer: true, lowerIsBetter: true }],
  },
  {
    type: 'combo_accuracy', label: 'Kombi-Genauigkeit', primaryField: 'correct',
    fields: [
      { key: 'correct', label: 'Richtig', integer: true },
      { key: 'total', label: 'Versuche gesamt', integer: true },
    ],
  },
  {
    type: 'vestibular_landing', label: 'Vestibuläre Landung', primaryField: 'stable',
    fields: [
      { key: 'stable', label: 'Stabile Landungen', integer: true },
      { key: 'stumble', label: 'Stolpern', integer: true, lowerIsBetter: true },
      { key: 'fall', label: 'Stürze', integer: true, lowerIsBetter: true },
    ],
  },
  {
    type: 'balance_poomsae', label: 'Einbein-Poomsae', primaryField: 'holdSeconds',
    fields: [
      { key: 'holdSeconds', label: 'Haltezeit', unit: 's' },
      { key: 'armErrors', label: 'Armfehler', integer: true, lowerIsBetter: true },
    ],
  },
  {
    type: 'poomsae_distraction', label: 'Poomsae unter Ablenkung', primaryField: 'errors',
    fields: [
      { key: 'errors', label: 'Sequenzfehler', integer: true, lowerIsBetter: true },
      { key: 'baseline', label: 'Basisfehler', integer: true, lowerIsBetter: true },
    ],
  },
];

/** All metric type ids present in a schema store. */
export function metricTypes(schemas: MetricTypeDef[]): string[] {
  return schemas.map(s => s.type);
}

export function getMetricSchema(schemas: MetricTypeDef[], type: string): MetricTypeDef | undefined {
  return schemas.find(s => s.type === type);
}

/**
 * Build an AssessmentMetric from a flat bag of field values, per the given schema.
 * Returns null when any field is missing/NaN (so callers can block save).
 */
export function buildMetric(
  schema: MetricTypeDef | undefined,
  values: Record<string, number | undefined>
): AssessmentMetric | null {
  if (!schema) return null;
  const out: Record<string, number> = {};
  for (const f of schema.fields) {
    const v = values[f.key];
    if (v === undefined || v === null || Number.isNaN(v)) return null;
    out[f.key] = f.integer ? Math.round(v) : v;
  }
  return { type: schema.type, ...out } as unknown as AssessmentMetric;
}

export interface FieldDelta {
  raw: number;
  /** True when the change is an improvement, honouring the field's lowerIsBetter. */
  improved: boolean;
}

/** Signed change for a field; null when there is no previous value to compare. */
export function fieldDelta(
  field: MetricFieldDef,
  current: number,
  previous: number | undefined
): FieldDelta | null {
  if (previous === undefined) return null;
  const raw = current - previous;
  const improved = field.lowerIsBetter ? raw < 0 : raw > 0;
  return { raw, improved };
}
