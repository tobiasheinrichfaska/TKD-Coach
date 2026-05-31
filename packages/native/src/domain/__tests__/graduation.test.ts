import { ageFacts, promote, demote, canConvertToDan, convertToDan } from '../graduation';

const REF = 2026;

describe('ageFacts', () => {
  it('unknown birth year → nothing definite', () => {
    expect(ageFacts(undefined, REF)).toEqual({ definitelyUnder15: false, definitely14OrAbove: false, definitely15OrAbove: false });
  });
  it('born 2015 (age 10–11) → definitely under 15', () => {
    const f = ageFacts(2015, REF);
    expect(f.definitelyUnder15).toBe(true);
    expect(f.definitely14OrAbove).toBe(false);
  });
  it('born 2012 (age 13–14) → still definitely under 15, not yet 14+', () => {
    const f = ageFacts(2012, REF);
    expect(f.definitelyUnder15).toBe(true);   // max 14
    expect(f.definitely14OrAbove).toBe(false); // min 13
  });
  it('born 2011 (age 14–15) → definitely 14+, not definitely 15+', () => {
    const f = ageFacts(2011, REF);
    expect(f.definitelyUnder15).toBe(false);
    expect(f.definitely14OrAbove).toBe(true);
    expect(f.definitely15OrAbove).toBe(false);
  });
  it('born 2010 (age 15–16) → definitely 15+', () => {
    expect(ageFacts(2010, REF).definitely15OrAbove).toBe(true);
  });
});

describe('promote', () => {
  it('walks the Kup spine from none', () => {
    expect(promote('none', undefined, REF)).toBe('kup-10');
    expect(promote('kup-10', undefined, REF)).toBe('kup-9');
    expect(promote('kup-2', undefined, REF)).toBe('kup-1');
  });
  it('1. Kup → Poom for youth / unknown / under-15', () => {
    expect(promote('kup-1', 2015, REF)).toBe('poom-1');     // under 15
    expect(promote('kup-1', undefined, REF)).toBe('poom-1'); // unknown
    expect(promote('kup-1', 2011, REF)).toBe('poom-1');      // 14–15, not definitely 15+
  });
  it('1. Kup → Dan only when definitely 15+', () => {
    expect(promote('kup-1', 2010, REF)).toBe('dan-1');
  });
  it('Poom promotes within Poom for youth, never to Dan', () => {
    expect(promote('poom-1', 2015, REF)).toBe('poom-2');
    expect(promote('poom-3', 2015, REF)).toBeNull(); // youth ceiling
  });
  it('Poom cannot promote (only convert) once definitely 15+', () => {
    expect(promote('poom-1', 2010, REF)).toBeNull();
  });
  it('Dan promotes up to 9. Dan', () => {
    expect(promote('dan-1', 2000, REF)).toBe('dan-2');
    expect(promote('dan-9', 2000, REF)).toBeNull();
  });
});

describe('demote', () => {
  it('walks back down the Kup spine to none', () => {
    expect(demote('kup-10')).toBe('none');
    expect(demote('none')).toBeNull();
    expect(demote('kup-9')).toBe('kup-10');
  });
  it('first black-belt grade demotes to 1. Kup', () => {
    expect(demote('poom-1')).toBe('kup-1');
    expect(demote('dan-1')).toBe('kup-1');
  });
  it('higher black-belt grades step down within their kind', () => {
    expect(demote('poom-2')).toBe('poom-1');
    expect(demote('dan-3')).toBe('dan-2');
  });
});

describe('convert to Dan', () => {
  it('available for a Poom only once definitely 14+', () => {
    expect(canConvertToDan('poom-1', 2011, REF)).toBe(true);  // 14–15
    expect(canConvertToDan('poom-1', 2010, REF)).toBe(true);  // 15+
    expect(canConvertToDan('poom-1', 2015, REF)).toBe(false); // under 15
    expect(canConvertToDan('poom-1', undefined, REF)).toBe(false);
  });
  it('not offered for non-Poom grades', () => {
    expect(canConvertToDan('kup-1', 2010, REF)).toBe(false);
    expect(canConvertToDan('dan-1', 2010, REF)).toBe(false);
  });
  it('maps Poom-N → Dan-N', () => {
    expect(convertToDan('poom-1')).toBe('dan-1');
    expect(convertToDan('poom-3')).toBe('dan-3');
    expect(convertToDan('kup-1')).toBeNull();
  });
});
