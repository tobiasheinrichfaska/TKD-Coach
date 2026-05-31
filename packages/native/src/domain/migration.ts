import { AppData, Person, ContactLink } from '../types';
import { BUILTIN_GAMES } from '../constants/games';
import { LEGACY_BELT_MAP } from '../constants/belts';
import { BUILTIN_TEMPLATES } from './templates';

/**
 * Bring stored data up to the current shape:
 * - refresh built-in Übungen + session templates from the seeds (preserving user-made ones);
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

  const userGames = (d.games || []).filter(
    (g: any) => !g.isBuiltIn && !BUILTIN_GAMES.some(b => b.id === g.id)
  );
  const userTemplates = (d.sessionTemplates || []).filter(
    (t: any) => !t.isBuiltIn && !BUILTIN_TEMPLATES.some(b => b.id === t.id)
  );

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

  // Rebuild the object explicitly so legacy keys (athletes/emergencyContacts) are dropped.
  return {
    version: d.version ?? 1,
    games: [...BUILTIN_GAMES, ...userGames],
    persons,
    groups: d.groups || [],
    sessionPlans: d.sessionPlans || [],
    sessionLogs: d.sessionLogs || [],
    assessments: d.assessments || [],
    sessionTemplates: [...BUILTIN_TEMPLATES, ...userTemplates],
    contactLinks,
    exportedAt: d.exportedAt,
  };
}
