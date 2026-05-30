import { Belt } from '../types';
import { COLORS } from './colors';

export interface BeltInfo {
  value: Belt;
  label: string;
  shortLabel: string;
  color: string;
  order: number;
}

export const BELT_INFOS: BeltInfo[] = [
  { value: 'white', label: 'Weiß', shortLabel: 'W', color: COLORS.belt_white, order: 0 },
  { value: 'yellow-tag', label: 'Gelb-Streifen', shortLabel: 'GS', color: '#FFE082', order: 1 },
  { value: 'yellow', label: 'Gelb', shortLabel: 'G', color: COLORS.belt_yellow, order: 2 },
  { value: 'green-tag', label: 'Grün-Streifen', shortLabel: 'GrS', color: '#66BB6A', order: 3 },
  { value: 'green', label: 'Grün', shortLabel: 'Gr', color: COLORS.belt_green, order: 4 },
  { value: 'blue-tag', label: 'Blau-Streifen', shortLabel: 'BS', color: '#64B5F6', order: 5 },
  { value: 'blue', label: 'Blau', shortLabel: 'B', color: COLORS.belt_blue, order: 6 },
  { value: 'red-tag', label: 'Rot-Streifen', shortLabel: 'RS', color: '#EF9A9A', order: 7 },
  { value: 'red', label: 'Rot', shortLabel: 'R', color: COLORS.belt_red, order: 8 },
  { value: 'black', label: 'Schwarz', shortLabel: 'Sw', color: COLORS.belt_black, order: 9 },
];

export function getBeltInfo(belt: Belt): BeltInfo | undefined {
  return BELT_INFOS.find(b => b.value === belt);
}

export function getBeltLabel(belt: Belt): string {
  return getBeltInfo(belt)?.label ?? belt;
}

export function getBeltColor(belt: Belt): string {
  return getBeltInfo(belt)?.color ?? COLORS.text;
}

export const BELT_OPTIONS = BELT_INFOS.map(b => ({ label: b.label, value: b.value }));
