import { SessionTemplate } from '../types';
import { SESSION_TEMPLATES } from '../constants/games';

// Canonical built-in session templates, derived from the SESSION_TEMPLATES seed.
// itemIds are ordered Übung (GameDefinition) ids. Catalog-integrity tests guard
// that every id here resolves to a built-in Übung.
export const BUILTIN_TEMPLATES: SessionTemplate[] = [
  {
    id: 'kids-2h',
    name: 'Kids 8-13 · 2h',
    ageGroup: 'kids',
    itemIds: [...SESSION_TEMPLATES.KIDS_2H],
    isBuiltIn: true,
    description: 'Full kids session: warm-up, neuro main block, cooldown.',
  },
  {
    id: 'youth-adult-1h30',
    name: 'Youth & Adults · 1.5h',
    ageGroup: 'youth-adults',
    itemIds: [...SESSION_TEMPLATES.YOUTH_ADULT_1H30],
    isBuiltIn: true,
    description: 'Standard youth/adult session.',
  },
  {
    id: 'mobility-warmup',
    name: 'Warm-Up · Mobility',
    ageGroup: 'all',
    itemIds: [...SESSION_TEMPLATES.MOBILITY_WARMUP],
    isBuiltIn: true,
    description: 'Joint prep and dynamic mobility flow.',
  },
  {
    id: 'static-block',
    name: 'Static Stretching Block',
    ageGroup: 'all',
    itemIds: [...SESSION_TEMPLATES.STATIC_BLOCK],
    isBuiltIn: true,
    description: 'End-of-session static flexibility block.',
  },
];

export function getTemplate(templates: SessionTemplate[], id: string): SessionTemplate | undefined {
  return templates.find(t => t.id === id);
}

export function templatesForAgeGroup(
  templates: SessionTemplate[],
  ageGroup: SessionTemplate['ageGroup'],
): SessionTemplate[] {
  return templates.filter(t => t.ageGroup === 'all' || t.ageGroup === ageGroup);
}
