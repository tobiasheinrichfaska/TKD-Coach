import { Group, TrainingSlot, Weekday } from '../types';

/**
 * Weekly training-schedule logic. Pure + UI-free. Weekdays are ISO (1 = Mon … 7 = Sun).
 * A reference Date is always passed in (no Date.now here) so the functions are testable.
 */

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 7: 'So',
};

export function weekdayLabel(w: Weekday): string {
  return WEEKDAY_LABELS[w] ?? '?';
}

/** ISO weekday (1=Mon … 7=Sun) of a Date. */
export function isoWeekday(d: Date): Weekday {
  return (((d.getDay() + 6) % 7) + 1) as Weekday;
}

export function formatSlot(slot: TrainingSlot): string {
  return `${weekdayLabel(slot.weekday)} ${slot.start} · ${slot.durationMin} min`;
}

/** Slots sorted by weekday then start time. */
export function sortedSlots(group: Group | undefined): TrainingSlot[] {
  return [...(group?.trainingTimes ?? [])].sort(
    (a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start),
  );
}

/** The slot(s) that fall on the given date's weekday. */
export function slotsOnDay(group: Group | undefined, date: Date): TrainingSlot[] {
  const wd = isoWeekday(date);
  return sortedSlots(group).filter(s => s.weekday === wd);
}

export function trainsOn(group: Group | undefined, date: Date): boolean {
  return slotsOnDay(group, date).length > 0;
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * The next training occurrence at or after `from` (inclusive of a slot still upcoming today).
 * Returns a Date set to the slot's local start time, or null if the group has no slots.
 */
export function nextSession(group: Group | undefined, from: Date): { date: Date; slot: TrainingSlot } | null {
  const slots = sortedSlots(group);
  if (slots.length === 0) return null;

  const fromMin = from.getHours() * 60 + from.getMinutes();
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(from);
    day.setDate(from.getDate() + offset);
    const wd = isoWeekday(day);
    const candidates = slots
      .filter(s => s.weekday === wd && (offset > 0 || toMinutes(s.start) >= fromMin))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (candidates.length > 0) {
      const slot = candidates[0];
      const [h, m] = slot.start.split(':').map(Number);
      const date = new Date(day);
      date.setHours(h || 0, m || 0, 0, 0);
      return { date, slot };
    }
  }
  return null;
}
