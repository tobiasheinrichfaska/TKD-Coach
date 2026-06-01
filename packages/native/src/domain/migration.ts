import { AppData, Person, ContactLink, GameDefinition } from '../types';
import { BUILTIN_GAMES } from '../constants/games';
import { LEGACY_BELT_MAP } from '../constants/belts';
import { BUILTIN_TEMPLATES } from './templates';
import { BUILTIN_BODY_PARTS } from './bodyparts';
import { BUILTIN_TECHNIQUES } from './techniques';
import { BUILTIN_METRIC_SCHEMAS } from './metrics';
import { reconcileRunningLogs } from './selectors';

/**
 * Bring stored data up to the current shape:
 * - seed built-in Übungen + session templates as factory defaults ONLY when empty (fresh install);
 *   existing data is kept (shape-normalised), never auto-overwritten;
 * - normalise game shape (drop phase/neuroTarget, single sessionPhase → sessionPhases[]);
 * - normalise legacy colour-belt ids to the Kup/Dan ladder;
 * - convert the legacy split model (athletes[] + emergencyContacts[]) to the unified
 *   Person model (persons[] + contactLinks[]), keeping every athlete's id as its Person id
 *   so group/assessment references stay valid;
 * - backfill collections missing on older saves.
 * Idempotent: already-migrated data (persons present) is passed through (belts re-normalised).
 * Pure — used by DataContext on load + as the fresh-install seed; unit-tested.
 */
export function migrate(data: AppData): AppData {
  const d = data as unknown as Record<string, any>;

  // Built-ins are factory defaults: seeded only when the collection is empty (fresh install).
  // Existing data is kept as-is (shape-normalised) — never auto-overwritten.
  const normalizeGame = (g: any): GameDefinition => {
    const { phase, neuroTarget, sessionPhase, sessionPhases, ...rest } = g;
    return { ...rest, sessionPhases: sessionPhases ?? (sessionPhase ? [sessionPhase] : [3]) } as GameDefinition;
  };
  const games = Array.isArray(d.games) && d.games.length ? d.games.map(normalizeGame) : BUILTIN_GAMES;
  const sessionTemplates = Array.isArray(d.sessionTemplates) && d.sessionTemplates.length
    ? d.sessionTemplates
    : BUILTIN_TEMPLATES;
  // Reference catalogs are now editable seed-once stores too.
  const seedOnce = <T>(stored: unknown, seed: T[]): T[] =>
    Array.isArray(stored) && stored.length ? (stored as T[]) : seed;
  const bodyParts = seedOnce(d.bodyParts, BUILTIN_BODY_PARTS);
  const techniques = seedOnce(d.techniques, BUILTIN_TECHNIQUES);
  const metricSchemas = seedOnce(d.metricSchemas, BUILTIN_METRIC_SCHEMAS);

  // --- Persons ---
  let persons: Person[];
  if (Array.isArray(d.persons)) {
    persons = d.persons as Person[];
  } else {
    // Convert legacy athletes → Person with an athlete role (keep the id).
    persons = (d.athletes || []).map((a: any): Person => ({
      id: a.id,
      name: a.name,
      email: a.contact?.email,
      phones: [a.contact?.phone].filter(Boolean),
      isCoach: false,
      athlete: {
        birthYear: a.birthYear,
        belt: a.belt,
        neuroProfile: a.neuroProfile,
        poomsae: a.poomsae || [],
        techniques: a.techniques || [],
        notes: a.notes,
      },
    }));
  }
  // Normalise belts on athlete profiles.
  persons = persons.map(p =>
    p.athlete && LEGACY_BELT_MAP[p.athlete.belt]
      ? { ...p, athlete: { ...p.athlete, belt: LEGACY_BELT_MAP[p.athlete.belt] } }
      : p
  );

  // --- Contact links ---
  let contactLinks: ContactLink[];
  if (Array.isArray(d.contactLinks)) {
    contactLinks = d.contactLinks as ContactLink[];
  } else {
    contactLinks = [];
    const contactPersons: Person[] = [];
    for (const ec of (d.emergencyContacts || []) as any[]) {
      contactPersons.push({ id: ec.id, name: ec.name, email: ec.email, phones: ec.phones || [], isCoach: false });
      for (const aid of (ec.athleteIds || []) as string[]) {
        contactLinks.push({ id: `link-${ec.id}-${aid}`, contactId: ec.id, athleteId: aid, guardian: !!ec.isGuardian });
      }
    }
    persons = [...persons, ...contactPersons];
  }

  // Groups: backfill trainingTimes; drop the retired ageCategory field.
  const groups = (d.groups || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    trainingTimes: g.trainingTimes || [],
    athleteIds: g.athleteIds || [],
  }));

  // Rebuild the object explicitly so legacy keys (athletes/emergencyContacts) are dropped.
  return {
    version: d.version ?? 1,
    games,
    persons,
    groups,
    sessionPlans: d.sessionPlans || [],
    sessionLogs: reconcileRunningLogs(d.sessionLogs || []),
    assessments: d.assessments || [],
    sessionTemplates,
    contactLinks,
    bodyParts,
    techniques,
    metricSchemas,
    exportedAt: d.exportedAt,
  };
}
