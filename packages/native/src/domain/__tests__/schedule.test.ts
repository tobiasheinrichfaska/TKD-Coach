import { weekdayLabel, isoWeekday, formatSlot, sortedSlots, slotsOnDay, trainsOn, nextSession } from '../schedule';
import { Group, TrainingSlot } from '../../types';

const slot = (weekday: TrainingSlot['weekday'], start: string, durationMin = 90): TrainingSlot => ({ weekday, start, durationMin });
const group = (times: TrainingSlot[]): Group => ({ id: 'g', name: 'G', trainingTimes: times, athleteIds: [] });

// 2026-06-01 is a Monday.
const MON = new Date(2026, 5, 1, 9, 0);

describe('weekday helpers', () => {
  it('isoWeekday maps Mon→1 … Sun→7', () => {
    expect(isoWeekday(new Date(2026, 5, 1))).toBe(1); // Mon
    expect(isoWeekday(new Date(2026, 5, 7))).toBe(7); // Sun
  });
  it('weekdayLabel + formatSlot', () => {
    expect(weekdayLabel(3)).toBe('Mi');
    expect(formatSlot(slot(1, '17:00', 90))).toBe('Mo 17:00 · 90 min');
  });
});

describe('sortedSlots / slotsOnDay / trainsOn', () => {
  const g = group([slot(3, '18:00'), slot(1, '17:00'), slot(1, '09:00')]);
  it('sorts by weekday then start', () => {
    expect(sortedSlots(g).map(s => `${s.weekday}:${s.start}`)).toEqual(['1:09:00', '1:17:00', '3:18:00']);
  });
  it('slotsOnDay + trainsOn for the date weekday', () => {
    expect(slotsOnDay(g, MON).map(s => s.start)).toEqual(['09:00', '17:00']); // Monday
    expect(trainsOn(g, MON)).toBe(true);
    expect(trainsOn(g, new Date(2026, 5, 2))).toBe(false); // Tuesday
  });
});

describe('nextSession', () => {
  it('returns a still-upcoming slot today', () => {
    const g = group([slot(1, '17:00', 120)]);
    const r = nextSession(g, MON)!; // Mon 09:00 → 17:00 same day
    expect(isoWeekday(r.date)).toBe(1);
    expect(r.date.getHours()).toBe(17);
    expect(r.slot.durationMin).toBe(120);
  });
  it('skips a slot already passed today to the next week', () => {
    const g = group([slot(1, '08:00')]);
    const r = nextSession(g, MON)!; // 09:00 now, 08:00 passed → next Monday
    expect(r.date.getDate()).toBe(8);
  });
  it('finds the soonest across multiple weekdays', () => {
    const g = group([slot(3, '18:00'), slot(2, '18:00')]);
    const r = nextSession(g, MON)!; // Tue before Wed
    expect(isoWeekday(r.date)).toBe(2);
  });
  it('null when there are no slots', () => {
    expect(nextSession(group([]), MON)).toBeNull();
  });
});
