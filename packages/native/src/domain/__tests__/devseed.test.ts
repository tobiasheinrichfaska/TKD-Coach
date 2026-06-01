import { devSeed } from '../devseed';

describe('devSeed', () => {
  const d = devSeed('2026-06-01');
  const personIds = new Set(d.persons.map(p => p.id));
  const gameIds = new Set(d.games.map(g => g.id));

  it('includes the factory catalogs', () => {
    expect(d.games.length).toBeGreaterThan(0);
    expect(d.bodyParts.length).toBeGreaterThan(0);
    expect(d.techniques.length).toBeGreaterThan(0);
    expect(d.metricSchemas.length).toBeGreaterThan(0);
    expect(d.sessionTemplates.length).toBeGreaterThan(0);
  });

  it('group memberships reference real persons', () => {
    for (const g of d.groups) for (const id of g.athleteIds) expect(personIds.has(id)).toBe(true);
  });

  it('contact links reference real persons on both sides', () => {
    for (const l of d.contactLinks) {
      expect(personIds.has(l.contactId)).toBe(true);
      expect(personIds.has(l.athleteId)).toBe(true);
    }
  });

  it('planned games + assessment refs resolve', () => {
    for (const p of d.sessionPlans) for (const gid of p.plannedGames) expect(gameIds.has(gid)).toBe(true);
    for (const a of d.assessments) { expect(personIds.has(a.athleteId)).toBe(true); expect(gameIds.has(a.gameId)).toBe(true); }
    for (const log of d.sessionLogs) for (const gl of log.gameLogs) expect(gameIds.has(gl.gameId)).toBe(true);
  });

  it('a session is planned for the given day', () => {
    expect(d.sessionPlans.some(p => p.plannedDate === '2026-06-01')).toBe(true);
  });
});
