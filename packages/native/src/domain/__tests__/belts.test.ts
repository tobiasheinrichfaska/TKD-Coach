import { BELT_INFOS, getBeltLabel, getBeltInfo, LEGACY_BELT_MAP } from '../../constants/belts';

describe('belt ladder', () => {
  it('has 23 unique ids in ascending order', () => {
    expect(BELT_INFOS).toHaveLength(23);
    const ids = BELT_INFOS.map(b => b.value);
    expect(new Set(ids).size).toBe(23);
    BELT_INFOS.forEach((b, i) => expect(b.order).toBe(i));
  });

  it('runs "keine Graduierung" → 9. Dan', () => {
    expect(BELT_INFOS[0].value).toBe('none');
    expect(BELT_INFOS[BELT_INFOS.length - 1].value).toBe('dan-9');
  });

  it('getBeltLabel resolves a known id and falls back to the raw value', () => {
    expect(getBeltLabel('kup-10')).toBe('10. Kup · Weiß');
    expect(getBeltLabel('mystery')).toBe('mystery');
  });

  it('every legacy belt maps to a real ladder id', () => {
    for (const newId of Object.values(LEGACY_BELT_MAP)) {
      expect(getBeltInfo(newId)).toBeDefined();
    }
  });
});
