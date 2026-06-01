import { defaultAttendance, toggleAttendance, presentCount, isPresent, absentIds, athleteAttendanceStats } from '../attendance';

describe('attendance', () => {
  it('defaults every athlete to absent (coach checks them in)', () => {
    const att = defaultAttendance(['a', 'b', 'c']);
    expect(att).toEqual([
      { athleteId: 'a', present: false },
      { athleteId: 'b', present: false },
      { athleteId: 'c', present: false },
    ]);
  });

  it('preserves existing marks and drops/adds for roster changes', () => {
    const existing = [
      { athleteId: 'a', present: true },
      { athleteId: 'gone', present: true },
    ];
    const att = defaultAttendance(['a', 'b'], existing);
    expect(att).toEqual([
      { athleteId: 'a', present: true }, // preserved present
      { athleteId: 'b', present: false }, // new, defaults absent
    ]);
    expect(att.find(e => e.athleteId === 'gone')).toBeUndefined();
  });

  it('toggles one athlete without mutating the input', () => {
    const att = defaultAttendance(['a', 'b']);
    const next = toggleAttendance(att, 'a');
    expect(isPresent(next, 'a')).toBe(true);
    expect(isPresent(next, 'b')).toBe(false);
    expect(att[0].present).toBe(false); // original untouched
  });

  it('counts present and lists absentees', () => {
    const att = [
      { athleteId: 'a', present: true },
      { athleteId: 'b', present: false },
      { athleteId: 'c', present: false },
    ];
    expect(presentCount(att)).toBe(1);
    expect(absentIds(att)).toEqual(['b', 'c']);
  });

  it('treats unknown attendance as present (legacy logs without the field)', () => {
    expect(isPresent(undefined, 'x')).toBe(true);
    expect(presentCount(undefined)).toBe(0);
    expect(absentIds(undefined)).toEqual([]);
  });

  it('aggregates an athlete attendance across logs (only counted where rostered)', () => {
    const logs = [
      { attendance: [{ athleteId: 'a', present: true }, { athleteId: 'b', present: false }] },
      { attendance: [{ athleteId: 'a', present: false }] },
      { attendance: [{ athleteId: 'b', present: true }] }, // a not rostered here
      { /* no attendance recorded */ },
    ];
    expect(athleteAttendanceStats(logs, 'a')).toEqual({ present: 1, total: 2 });
    expect(athleteAttendanceStats(logs, 'b')).toEqual({ present: 1, total: 2 });
    expect(athleteAttendanceStats(logs, 'nobody')).toEqual({ present: 0, total: 0 });
  });
});
