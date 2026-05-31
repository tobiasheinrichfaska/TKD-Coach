import { Belt } from '../types';
import { COLORS } from './colors';

export interface BeltInfo {
  value: Belt;
  label: string;
  shortLabel: string;
  color: string;
  order: number;
  kind: 'none' | 'kup' | 'poom' | 'dan';
}

// Canonical Taekwondo grade ladder: "keine Graduierung", 10.–1. Kup (colour belts), then Poom/Dan.
// `value` is the stored id; `label` is the display string. `order` is ascending rank.
export const BELT_INFOS: BeltInfo[] = [
  { value: 'none',   label: 'Keine Graduierung',    shortLabel: '–',    color: COLORS.disabled,    order: 0,  kind: 'none' },
  { value: 'kup-10', label: '10. Kup · Weiß',       shortLabel: '10.K', color: COLORS.belt_white,  order: 1,  kind: 'kup' },
  { value: 'kup-9',  label: '9. Kup · Weiß-Gelb',   shortLabel: '9.K',  color: '#FFF1B8',          order: 2,  kind: 'kup' },
  { value: 'kup-8',  label: '8. Kup · Gelb',        shortLabel: '8.K',  color: COLORS.belt_yellow, order: 3,  kind: 'kup' },
  { value: 'kup-7',  label: '7. Kup · Gelb-Grün',   shortLabel: '7.K',  color: '#C5E1A5',          order: 4,  kind: 'kup' },
  { value: 'kup-6',  label: '6. Kup · Grün',        shortLabel: '6.K',  color: COLORS.belt_green,  order: 5,  kind: 'kup' },
  { value: 'kup-5',  label: '5. Kup · Grün-Blau',   shortLabel: '5.K',  color: '#80CBC4',          order: 6,  kind: 'kup' },
  { value: 'kup-4',  label: '4. Kup · Blau',        shortLabel: '4.K',  color: COLORS.belt_blue,   order: 7,  kind: 'kup' },
  { value: 'kup-3',  label: '3. Kup · Blau-Rot',    shortLabel: '3.K',  color: '#9575CD',          order: 8,  kind: 'kup' },
  { value: 'kup-2',  label: '2. Kup · Rot',         shortLabel: '2.K',  color: COLORS.belt_red,    order: 9,  kind: 'kup' },
  { value: 'kup-1',  label: '1. Kup · Rot-Schwarz', shortLabel: '1.K',  color: '#7A1F1F',          order: 10, kind: 'kup' },
  { value: 'poom-1', label: '1. Poom',              shortLabel: '1.P',  color: COLORS.belt_black,  order: 11, kind: 'poom' },
  { value: 'dan-1',  label: '1. Dan',               shortLabel: '1.D',  color: COLORS.belt_black,  order: 12, kind: 'dan' },
  { value: 'poom-2', label: '2. Poom',              shortLabel: '2.P',  color: COLORS.belt_black,  order: 13, kind: 'poom' },
  { value: 'dan-2',  label: '2. Dan',               shortLabel: '2.D',  color: COLORS.belt_black,  order: 14, kind: 'dan' },
  { value: 'poom-3', label: '3. Poom',              shortLabel: '3.P',  color: COLORS.belt_black,  order: 15, kind: 'poom' },
  { value: 'dan-3',  label: '3. Dan',               shortLabel: '3.D',  color: COLORS.belt_black,  order: 16, kind: 'dan' },
  { value: 'dan-4',  label: '4. Dan',               shortLabel: '4.D',  color: COLORS.belt_black,  order: 17, kind: 'dan' },
  { value: 'dan-5',  label: '5. Dan',               shortLabel: '5.D',  color: COLORS.belt_black,  order: 18, kind: 'dan' },
  { value: 'dan-6',  label: '6. Dan',               shortLabel: '6.D',  color: COLORS.belt_black,  order: 19, kind: 'dan' },
  { value: 'dan-7',  label: '7. Dan',               shortLabel: '7.D',  color: COLORS.belt_black,  order: 20, kind: 'dan' },
  { value: 'dan-8',  label: '8. Dan',               shortLabel: '8.D',  color: COLORS.belt_black,  order: 21, kind: 'dan' },
  { value: 'dan-9',  label: '9. Dan',               shortLabel: '9.D',  color: COLORS.belt_black,  order: 22, kind: 'dan' },
];

/** Legacy colour-belt ids (pre-ladder) → new ids, for migrating stored athletes. */
export const LEGACY_BELT_MAP: Record<string, Belt> = {
  white: 'kup-10', 'yellow-tag': 'kup-9', yellow: 'kup-8', 'green-tag': 'kup-7', green: 'kup-6',
  'blue-tag': 'kup-5', blue: 'kup-4', 'red-tag': 'kup-3', red: 'kup-2', black: 'dan-1',
};

export function getBeltInfo(belt: string): BeltInfo | undefined {
  return BELT_INFOS.find(b => b.value === belt);
}

export function getBeltLabel(belt: string): string {
  return getBeltInfo(belt)?.label ?? belt;
}

export function getBeltColor(belt: string): string {
  return getBeltInfo(belt)?.color ?? COLORS.text;
}

export const BELT_OPTIONS = BELT_INFOS.map(b => ({ label: b.label, value: b.value }));
