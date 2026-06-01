import { BodyPart } from '../types';

/** Factory seed for the body-part catalog (joints + muscles + neuro abilities).
 *  Stored editable in AppData.bodyParts (seed-once). */
export const BUILTIN_BODY_PARTS: BodyPart[] = [
  { id: 'ankle', name: 'Sprunggelenk', region: 'lower-leg', kind: 'joint' },
  { id: 'calves', name: 'Waden', region: 'lower-leg', kind: 'muscle' },
  { id: 'knee', name: 'Knie', region: 'upper-leg', kind: 'joint' },
  { id: 'hamstrings', name: 'Beinbeuger', region: 'upper-leg', kind: 'muscle' },
  { id: 'quads', name: 'Quadrizeps', region: 'upper-leg', kind: 'muscle' },
  { id: 'adductors', name: 'Adduktoren', region: 'upper-leg', kind: 'muscle' },
  { id: 'hip', name: 'Hüfte', region: 'hips', kind: 'joint' },
  { id: 'hip-flexors', name: 'Hüftbeuger', region: 'hips', kind: 'muscle' },
  { id: 'glutes', name: 'Gesäß', region: 'hips', kind: 'muscle' },
  { id: 'core', name: 'Rumpf', region: 'core', kind: 'muscle' },
  { id: 'spine', name: 'Wirbelsäule', region: 'spine', kind: 'region' },
  { id: 'shoulders', name: 'Schultern', region: 'shoulders', kind: 'joint' },
  { id: 'arms', name: 'Arme', region: 'arms', kind: 'muscle' },
  { id: 'neck', name: 'Nacken', region: 'neck', kind: 'joint' },
  { id: 'wrist', name: 'Handgelenk', region: 'arms', kind: 'joint' },
  { id: 'feet', name: 'Füße', region: 'lower-leg', kind: 'joint' },
  { id: 'lower-back', name: 'Unterer Rücken', region: 'spine', kind: 'region' },
  { id: 'obliques', name: 'Schräge Bauchmuskeln', region: 'core', kind: 'muscle' },
  { id: 'hip-rotators', name: 'Hüftrotatoren', region: 'hips', kind: 'muscle' },
  { id: 'it-band', name: 'IT-Band', region: 'upper-leg', kind: 'region' },
  { id: 'achilles', name: 'Achillessehne', region: 'lower-leg', kind: 'region' },
  { id: 'full-body', name: 'Ganzkörper', region: 'full-body', kind: 'region' },

  // ===== Neuro-athletic abilities (tagged like body parts; kind 'neuro') =====
  // Core systems — these three align with Athlete.neuroProfile.
  { id: 'vestibular', name: 'Vestibulär', region: 'neuro', kind: 'neuro' },
  { id: 'visual', name: 'Visuell', region: 'neuro', kind: 'neuro' },
  { id: 'proprioception', name: 'Propriozeption', region: 'neuro', kind: 'neuro' },
  // Functional abilities the drills train.
  { id: 'reaction', name: 'Reaktion', region: 'neuro', kind: 'neuro' },
  { id: 'coordination', name: 'Koordination', region: 'neuro', kind: 'neuro' },
  { id: 'balance', name: 'Gleichgewicht', region: 'neuro', kind: 'neuro' },
  { id: 'working-memory', name: 'Arbeitsgedächtnis', region: 'neuro', kind: 'neuro' },
  { id: 'attention', name: 'Aufmerksamkeit / Fokus', region: 'neuro', kind: 'neuro' },
  { id: 'gaze-stability', name: 'Blickstabilität (VOR)', region: 'neuro', kind: 'neuro' },
  { id: 'recovery', name: 'Erholung (parasympathisch)', region: 'neuro', kind: 'neuro' },
];

export function getBodyPart(bodyParts: BodyPart[], id: string): BodyPart | undefined {
  return bodyParts.find(b => b.id === id);
}
export function bodyPartName(bodyParts: BodyPart[], id: string): string {
  return getBodyPart(bodyParts, id)?.name ?? id;
}
/** Neuro-ability entries (the 'neuro' kind) — for filtering vs anatomical parts. */
export function neuroAbilities(bodyParts: BodyPart[]): BodyPart[] {
  return bodyParts.filter(b => b.kind === 'neuro');
}
