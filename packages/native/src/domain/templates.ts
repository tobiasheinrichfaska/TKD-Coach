import { SessionTemplate } from '../types';
import { SESSION_TEMPLATES } from '../constants/games';

// Canonical built-in session templates, derived from the SESSION_TEMPLATES seed.
// itemIds are ordered Übung (GameDefinition) ids. Catalog-integrity tests guard
// that every id here resolves to a built-in Übung.
export const BUILTIN_TEMPLATES: SessionTemplate[] = [
  {
    id: 'kids-2h',
    name: 'Kinder 8-13 · 2h',
    ageGroup: 'kids',
    itemIds: [...SESSION_TEMPLATES.KIDS_2H],
    isBuiltIn: true,
    description: 'Komplette Kinder-Session: Aufwärmen, Neuro-Hauptteil, Cool-down.',
  },
  {
    id: 'youth-adult-1h30',
    name: 'Jugend & Erwachsene · 1,5h',
    ageGroup: 'youth-adults',
    itemIds: [...SESSION_TEMPLATES.YOUTH_ADULT_1H30],
    isBuiltIn: true,
    description: 'Standard-Session für Jugend/Erwachsene.',
  },
  {
    id: 'mobility-warmup',
    name: 'Aufwärmen · Mobilität',
    ageGroup: 'all',
    itemIds: [...SESSION_TEMPLATES.MOBILITY_WARMUP],
    isBuiltIn: true,
    description: 'Gelenkvorbereitung und dynamischer Mobilitäts-Flow.',
  },
  {
    id: 'static-block',
    name: 'Statischer Dehn-Block',
    ageGroup: 'all',
    itemIds: [...SESSION_TEMPLATES.STATIC_BLOCK],
    isBuiltIn: true,
    description: 'Statischer Flexibilitätsblock zum Abschluss.',
  },
  {
    id: 'tornado-vestibular',
    name: 'Tornadokick · Vestibulär-Fokus',
    ageGroup: 'youth-adults',
    itemIds: [...SESSION_TEMPLATES.TORNADO_VESTIBULAR],
    isBuiltIn: true,
    description: 'Mobilisierung und neuro-dynamisches Aufwärmen, vestibulär-visuell geführte Tornadokick-Progression im Hauptteil, gestraffter Cool-down und Atem-Down-Regulation.',
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
