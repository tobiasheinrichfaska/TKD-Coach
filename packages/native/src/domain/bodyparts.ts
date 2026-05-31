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
  { id: 'full-body', name: 'Full body', region: 'full-body', kind: 'region' },
];

const BY_ID = new Map(BODY_PARTS.map(b => [b.id, b]));

export function getBodyPart(id: string): BodyPart | undefined {
  return BY_ID.get(id);
}
export function bodyPartName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
