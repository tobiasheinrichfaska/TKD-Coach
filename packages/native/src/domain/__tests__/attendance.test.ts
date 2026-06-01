import { defaultAttendance, toggleAttendance, presentCount, isPresent, absentIds } from '../attendance';

describe('attendance', () => {
  it('defaults every athlete to present', () => {
    const att = defaultAttendance(['a', 'b', 'c']);
    expect(att).toEqual([
      { athleteId: 'a', present: true },
      { athleteId: 'b', present: true },
      { athleteId: 'c', present: true },
    ]);
  });

  it('preserves existing marks and drops/adds for roster changes', () => {
    const existing = [
      { athleteId: 'a', present: false },
      { athleteId: 'gone', present: true },
    ];
    const att = defaultAttendance(['a', 'b'], existing);
    expect(att).toEqual([
      { athleteId: 'a', present: false }, // preserved absent
      { athleteId: 'b', present: true }, // new, defaults present
    ]);
    expect(att.find(e => e.athleteId === 'gone')).toBeUndefined();
  });

  it('toggles one athlete without mutating the input', () => {
    const att = defaultAttendance(['a', 'b']);
    const next = toggleAttendance(att, 'a');
    expect(isPresent(next, 'a')).toBe(false);
    expect(isPresent(next, 'b')).toBe(true);
    expect(att[0].present).toBe(true); // original untouched
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
});
