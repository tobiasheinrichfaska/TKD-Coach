import { AssessmentMetric, AssessmentMetricType } from '../types';

/** A single numeric field of an assessment metric. */
export interface MetricFieldDef {
  key: string;
  label: string;
  unit?: string;
  /** Whole numbers only (counts). */
  integer?: boolean;
  /** Lower values are better (e.g. error counts) — flips the improvement direction. */
  lowerIsBetter?: boolean;
}

export interface MetricTypeDef {
  type: AssessmentMetricType;
  label: string;
  /** Field used for the headline progress delta. */
  primaryField: string;
  fields: MetricFieldDef[];
}

/**
 * Data-driven definition of every assessment metric. The assessment form, validation,
 * and progress delta/colour are all generated from this — no per-type UI code.
 */
export const METRIC_SCHEMAS: Record<AssessmentMetricType, MetricTypeDef> = {
  balance_hold: {
    type: 'balance_hold', label: 'Balance Hold', primaryField: 'dominant',
    fields: [
      { key: 'dominant', label: 'Dominant leg', unit: 's' },
      { key: 'nonDominant', label: 'Non-dominant leg', unit: 's' },
    ],
  },
  reaction_errors: {
    type: 'reaction_errors', label: 'Reaction Errors', primaryField: 'errorsPerTen',
    fields: [{ key: 'errorsPerTen', label: 'Errors per 10 cues', integer: true, lowerIsBetter: true }],
  },
  combo_accuracy: {
    type: 'combo_accuracy', label: 'Combo Accuracy', primaryField: 'correct',
    fields: [
      { key: 'correct', label: 'Correct', integer: true },
      { key: 'total', label: 'Total attempts', integer: true },
    ],
  },
  vestibular_landing: {
    type: 'vestibular_landing', label: 'Vestibular Landing', primaryField: 'stable',
    fields: [
      { key: 'stable', label: 'Stable landings', integer: true },
      { key: 'stumble', label: 'Stumbles', integer: true, lowerIsBetter: true },
      { key: 'fall', label: 'Falls', integer: true, lowerIsBetter: true },
    ],
  },
  balance_poomsae: {
    type: 'balance_poomsae', label: 'Single-leg Poomsae', primaryField: 'holdSeconds',
    fields: [
      { key: 'holdSeconds', label: 'Hold time', unit: 's' },
      { key: 'armErrors', label: 'Arm errors', integer: true, lowerIsBetter: true },
    ],
  },
  poomsae_distraction: {
    type: 'poomsae_distraction', label: 'Poomsae under Distraction', primaryField: 'errors',
    fields: [
      { key: 'errors', label: 'Sequence errors', integer: true, lowerIsBetter: true },
      { key: 'baseline', label: 'Baseline errors', integer: true, lowerIsBetter: true },
    ],
  },
};

/** All metric types that have a schema. */
export const METRIC_TYPES = Object.keys(METRIC_SCHEMAS) as AssessmentMetricType[];

export function getMetricSchema(type: AssessmentMetricType): MetricTypeDef {
  return METRIC_SCHEMAS[type];
}

/**
 * Build a typed AssessmentMetric from a flat bag of field values.
 * Returns null when any required field is missing/NaN (so callers can block save).
 */
export function buildMetric(
  type: AssessmentMetricType,
  values: Record<string, number | undefined>
): AssessmentMetric | null {
  const schema = METRIC_SCHEMAS[type];
  if (!schema) return null;
  const out: Record<string, number> = {};
  for (const f of schema.fields) {
    const v = values[f.key];
    if (v === undefined || v === null || Number.isNaN(v)) return null;
    out[f.key] = f.integer ? Math.round(v) : v;
  }
  return { type, ...out } as unknown as AssessmentMetric;
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
