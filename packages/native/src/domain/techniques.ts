import { Technique } from '../types';

/** Canonical technique catalog. `bodyPartIds` reference the BodyPart catalog. */
export const TECHNIQUES: Technique[] = [
  { id: 'ap-chagi', name: 'Ap Chagi', koreanName: '앞차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'hip-flexors'] },
  { id: 'dollyo-chagi', name: 'Dollyo Chagi', koreanName: '돌려차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'adductors'] },
  { id: 'yop-chagi', name: 'Yop Chagi', koreanName: '옆차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'adductors', 'core'] },
  { id: 'dwit-chagi', name: 'Dwit Chagi', koreanName: '뒤차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'core'] },
  { id: 'ap-seogi', name: 'Ap Seogi', category: 'stance', bodyPartIds: ['hip', 'knee', 'ankle'] },
  { id: 'juchum-seogi', name: 'Juchum Seogi', category: 'stance', bodyPartIds: ['hip', 'knee', 'adductors'] },
  { id: 'seogi', name: 'Seogi (stances)', category: 'stance', bodyPartIds: ['hip', 'knee', 'ankle'] },
  { id: 'makki', name: 'Makki (blocks)', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'arae-makki', name: 'Arae Makki', category: 'block', bodyPartIds: ['shoulders', 'arms', 'core'] },
  { id: 'momtong-makki', name: 'Momtong Makki', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'olgul-makki', name: 'Olgul Makki', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'jireugi', name: 'Jireugi (punch)', category: 'strike', bodyPartIds: ['shoulders', 'arms', 'core'] },
  { id: 'poomsae', name: 'Poomsae', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'footwork', name: 'Footwork', category: 'footwork', bodyPartIds: ['ankle', 'knee', 'hip'] },
];

const BY_ID = new Map(TECHNIQUES.map(t => [t.id, t]));

export function getTechnique(id: string): Technique | undefined {
  return BY_ID.get(id);
}
export function techniqueName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
