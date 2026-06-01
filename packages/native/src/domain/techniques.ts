import { Technique } from '../types';

/** Factory seed for the technique catalog. Stored editable in AppData.techniques (seed-once).
 *  `bodyPartIds` reference the BodyPart catalog. */
export const BUILTIN_TECHNIQUES: Technique[] = [
  { id: 'ap-chagi', name: 'Ap Chagi', koreanName: '앞차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'hip-flexors'] },
  { id: 'dollyo-chagi', name: 'Dollyo Chagi', koreanName: '돌려차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'adductors'] },
  { id: 'yop-chagi', name: 'Yop Chagi', koreanName: '옆차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'ankle', 'adductors', 'core'] },
  { id: 'dwit-chagi', name: 'Dwit Chagi', koreanName: '뒤차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'core'] },
  { id: 'ap-seogi', name: 'Ap Seogi', category: 'stance', bodyPartIds: ['hip', 'knee', 'ankle'] },
  { id: 'juchum-seogi', name: 'Juchum Seogi', category: 'stance', bodyPartIds: ['hip', 'knee', 'adductors'] },
  { id: 'seogi', name: 'Seogi (Stände)', category: 'stance', bodyPartIds: ['hip', 'knee', 'ankle'] },
  { id: 'makki', name: 'Makki (Blöcke)', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'arae-makki', name: 'Arae Makki', category: 'block', bodyPartIds: ['shoulders', 'arms', 'core'] },
  { id: 'momtong-makki', name: 'Momtong Makki', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'olgul-makki', name: 'Olgul Makki', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'jireugi', name: 'Jireugi (Fauststoß)', category: 'strike', bodyPartIds: ['shoulders', 'arms', 'core'] },
  { id: 'poomsae', name: 'Poomsae', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'footwork', name: 'Beinarbeit', category: 'footwork', bodyPartIds: ['ankle', 'knee', 'hip'] },

  // ===== Kicks (extended) =====
  { id: 'naeryo-chagi', name: 'Naeryo Chagi', koreanName: '내려차기', category: 'kick', bodyPartIds: ['hamstrings', 'hip-flexors', 'hip', 'knee'] },
  { id: 'bandal-chagi', name: 'Bandal Chagi', koreanName: '반달차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'adductors'] },
  { id: 'huryeo-chagi', name: 'Huryeo Chagi', koreanName: '후려차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'hamstrings', 'glutes'] },
  { id: 'dwit-huryeo-chagi', name: 'Dwit Huryeo Chagi', koreanName: '뒤후려차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'core', 'vestibular'] },
  { id: 'momdollyo-chagi', name: 'Momdollyo Chagi', koreanName: '몸돌려차기', category: 'kick', bodyPartIds: ['hip', 'knee', 'core', 'vestibular'] },
  { id: 'twio-chagi', name: 'Twio Chagi', koreanName: '뛰어차기', category: 'kick', bodyPartIds: ['full-body', 'calves', 'ankle', 'achilles'] },

  // ===== Stances (extended) =====
  { id: 'ap-kubi', name: 'Ap Kubi', koreanName: '앞굽이', category: 'stance', bodyPartIds: ['hip', 'knee', 'quads', 'hip-flexors'] },
  { id: 'dwit-kubi', name: 'Dwit Kubi', koreanName: '뒤굽이', category: 'stance', bodyPartIds: ['hip', 'knee', 'quads', 'ankle'] },
  { id: 'beom-seogi', name: 'Beom Seogi', koreanName: '범서기', category: 'stance', bodyPartIds: ['knee', 'ankle', 'calves'] },

  // ===== Blocks (extended) =====
  { id: 'sonnal-makki', name: 'Sonnal Makki', koreanName: '손날막기', category: 'block', bodyPartIds: ['shoulders', 'arms', 'core'] },
  { id: 'an-makki', name: 'An Makki', koreanName: '안막기', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'bakkat-makki', name: 'Bakkat Makki', koreanName: '바깥막기', category: 'block', bodyPartIds: ['shoulders', 'arms'] },
  { id: 'batangson-makki', name: 'Batangson Makki', koreanName: '바탕손막기', category: 'block', bodyPartIds: ['shoulders', 'arms', 'wrist'] },

  // ===== Strikes (extended) =====
  { id: 'sonnal-chigi', name: 'Sonnal Chigi', koreanName: '손날치기', category: 'strike', bodyPartIds: ['arms', 'shoulders', 'core'] },
  { id: 'palkup-chigi', name: 'Palkup Chigi', koreanName: '팔꿉치기', category: 'strike', bodyPartIds: ['arms', 'shoulders', 'core'] },
  { id: 'dung-jumeok', name: 'Dung Jumeok', koreanName: '등주먹', category: 'strike', bodyPartIds: ['arms', 'shoulders', 'wrist'] },

  // ===== Poomsae — Taegeuk (colour belt) =====
  { id: 'taegeuk-1', name: 'Taegeuk Il-Jang', koreanName: '태극 1장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-2', name: 'Taegeuk I-Jang', koreanName: '태극 2장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-3', name: 'Taegeuk Sam-Jang', koreanName: '태극 3장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-4', name: 'Taegeuk Sa-Jang', koreanName: '태극 4장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-5', name: 'Taegeuk O-Jang', koreanName: '태극 5장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-6', name: 'Taegeuk Yuk-Jang', koreanName: '태극 6장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-7', name: 'Taegeuk Chil-Jang', koreanName: '태극 7장', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taegeuk-8', name: 'Taegeuk Pal-Jang', koreanName: '태극 8장', category: 'poomsae', bodyPartIds: ['full-body'] },

  // ===== Poomsae — Yudanja (black belt) =====
  { id: 'koryo', name: 'Koryo', koreanName: '고려', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'keumgang', name: 'Keumgang', koreanName: '금강', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'taebaek', name: 'Taebaek', koreanName: '태백', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'pyongwon', name: 'Pyongwon', koreanName: '평원', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'sipjin', name: 'Sipjin', koreanName: '십진', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'jitae', name: 'Jitae', koreanName: '지태', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'cheonkwon', name: 'Cheonkwon', koreanName: '천권', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'hansu', name: 'Hansu', koreanName: '한수', category: 'poomsae', bodyPartIds: ['full-body'] },
  { id: 'ilyeo', name: 'Ilyeo', koreanName: '일여', category: 'poomsae', bodyPartIds: ['full-body'] },
];

export function getTechnique(techniques: Technique[], id: string): Technique | undefined {
  return techniques.find(t => t.id === id);
}
export function techniqueName(techniques: Technique[], id: string): string {
  return getTechnique(techniques, id)?.name ?? id;
}
