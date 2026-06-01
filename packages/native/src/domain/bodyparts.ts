import { BodyPart } from '../types';

/** Canonical body-part catalog: joints + major muscle groups (~drives tags + heatmap). */
export const BODY_PARTS: BodyPart[] = [
  { id: 'ankle', name: 'Ankle', region: 'lower-leg', kind: 'joint' },
  { id: 'calves', name: 'Calves', region: 'lower-leg', kind: 'muscle' },
  { id: 'knee', name: 'Knee', region: 'upper-leg', kind: 'joint' },
  { id: 'hamstrings', name: 'Hamstrings', region: 'upper-leg', kind: 'muscle' },
  { id: 'quads', name: 'Quadriceps', region: 'upper-leg', kind: 'muscle' },
  { id: 'adductors', name: 'Adductors', region: 'upper-leg', kind: 'muscle' },
  { id: 'hip', name: 'Hip', region: 'hips', kind: 'joint' },
  { id: 'hip-flexors', name: 'Hip flexors', region: 'hips', kind: 'muscle' },
  { id: 'glutes', name: 'Glutes', region: 'hips', kind: 'muscle' },
  { id: 'core', name: 'Core', region: 'core', kind: 'muscle' },
  { id: 'spine', name: 'Spine', region: 'spine', kind: 'region' },
  { id: 'shoulders', name: 'Shoulders', region: 'shoulders', kind: 'joint' },
  { id: 'arms', name: 'Arms', region: 'arms', kind: 'muscle' },
  { id: 'neck', name: 'Neck', region: 'neck', kind: 'joint' },
  { id: 'wrist', name: 'Wrist', region: 'arms', kind: 'joint' },
  { id: 'feet', name: 'Feet', region: 'lower-leg', kind: 'joint' },
  { id: 'lower-back', name: 'Lower back', region: 'spine', kind: 'region' },
  { id: 'obliques', name: 'Obliques', region: 'core', kind: 'muscle' },
  { id: 'hip-rotators', name: 'Hip rotators', region: 'hips', kind: 'muscle' },
  { id: 'it-band', name: 'IT band', region: 'upper-leg', kind: 'region' },
  { id: 'achilles', name: 'Achilles', region: 'lower-leg', kind: 'region' },
  { id: 'full-body', name: 'Full body', region: 'full-body', kind: 'region' },

  // ===== Neuro-athletic abilities (tagged like body parts; kind 'neuro') =====
  // Core systems — these three align with Athlete.neuroProfile.
  { id: 'vestibular', name: 'Vestibular', region: 'neuro', kind: 'neuro' },
  { id: 'visual', name: 'Visual', region: 'neuro', kind: 'neuro' },
  { id: 'proprioception', name: 'Proprioception', region: 'neuro', kind: 'neuro' },
  // Functional abilities the drills train.
  { id: 'reaction', name: 'Reaction', region: 'neuro', kind: 'neuro' },
  { id: 'coordination', name: 'Coordination', region: 'neuro', kind: 'neuro' },
  { id: 'balance', name: 'Balance', region: 'neuro', kind: 'neuro' },
  { id: 'working-memory', name: 'Working memory', region: 'neuro', kind: 'neuro' },
  { id: 'attention', name: 'Attention / Focus', region: 'neuro', kind: 'neuro' },
  { id: 'gaze-stability', name: 'Gaze stability (VOR)', region: 'neuro', kind: 'neuro' },
  { id: 'recovery', name: 'Recovery (parasympathetic)', region: 'neuro', kind: 'neuro' },
];

/** Neuro-ability entries (the 'neuro' kind) — for filtering vs anatomical parts. */
export const NEURO_ABILITIES: BodyPart[] = BODY_PARTS.filter(b => b.kind === 'neuro');

const BY_ID = new Map(BODY_PARTS.map(b => [b.id, b]));

export function getBodyPart(id: string): BodyPart | undefined {
  return BY_ID.get(id);
}
export function bodyPartName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
