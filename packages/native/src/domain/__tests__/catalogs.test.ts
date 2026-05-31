import { BODY_PARTS, getBodyPart } from '../bodyparts';
import { TECHNIQUES, getTechnique } from '../techniques';
import { BUILTIN_GAMES } from '../../constants/games';

const bodyPartIds = new Set(BODY_PARTS.map(b => b.id));
const techniqueIds = new Set(TECHNIQUES.map(t => t.id));

describe('catalog integrity', () => {
  it('body-part ids are unique', () => {
    expect(BODY_PARTS.length).toBe(bodyPartIds.size);
  });

  it('technique ids are unique', () => {
    expect(TECHNIQUES.length).toBe(techniqueIds.size);
  });

  it('every technique references only known body parts', () => {
    for (const t of TECHNIQUES) {
      for (const bp of t.bodyPartIds) {
        expect(bodyPartIds.has(bp)).toBe(true);
      }
    }
  });

  it('every Übung body-part tag resolves to the catalog', () => {
    const missing: string[] = [];
    for (const g of BUILTIN_GAMES) {
      for (const bp of g.bodyParts || []) if (!bodyPartIds.has(bp)) missing.push(`${g.id}:${bp}`);
    }
    expect(missing).toEqual([]);
  });

  it('every Übung technique tag resolves to the catalog', () => {
    const missing: string[] = [];
    for (const g of BUILTIN_GAMES) {
      for (const tk of g.techniques || []) if (!techniqueIds.has(tk)) missing.push(`${g.id}:${tk}`);
    }
    expect(missing).toEqual([]);
  });

  it('lookups return entries or undefined', () => {
    expect(getBodyPart('knee')?.region).toBe('upper-leg');
    expect(getTechnique('yop-chagi')?.category).toBe('kick');
    expect(getBodyPart('nope')).toBeUndefined();
    expect(getTechnique('nope')).toBeUndefined();
  });
});
