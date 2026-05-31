import { Person, AthleteProfile, Group, ContactLink } from '../types';

/**
 * People & roles. One Person is the identity; athlete/coach are roles (composition,
 * not inheritance). "Athlete" stays a first-class concept in the UI via the flat
 * AthleteView read-model, so display screens keep reading .name/.belt/.birthYear.
 */

// ===== Person lookups =====

export function getPerson(persons: Person[], id: string): Person | undefined {
  return persons.find(p => p.id === id);
}

export function personName(persons: Person[], id: string): string {
  return getPerson(persons, id)?.name ?? 'Unknown';
}

export function coaches(persons: Person[]): Person[] {
  return persons.filter(p => p.isCoach);
}

// ===== Athlete role (a Person with an athlete profile) =====

/** Flattened athlete read-model: person identity + athlete-profile fields in one object. */
export interface AthleteView extends AthleteProfile {
  id: string;
  name: string;
  email?: string;
  phones: string[];
  isCoach: boolean;
}

/** View for one person, or null if they don't hold the athlete role. */
export function toAthleteView(p: Person | undefined): AthleteView | null {
  if (!p || !p.athlete) return null;
  return { id: p.id, name: p.name, email: p.email, phones: p.phones, isCoach: p.isCoach, ...p.athlete };
}

/** All persons who train, as flat AthleteViews. */
export function athleteViews(persons: Person[]): AthleteView[] {
  return persons.filter(p => p.athlete).map(p => toAthleteView(p) as AthleteView);
}

/** Athletes in a group, in the group's stored order. Missing/non-athlete ids are skipped. */
export function athletesInGroup(persons: Person[], group: Group | undefined): AthleteView[] {
  if (!group) return [];
  const byId = new Map(persons.map(p => [p.id, p]));
  return group.athleteIds
    .map(id => toAthleteView(byId.get(id)))
    .filter((a): a is AthleteView => a !== null);
}

/** Every group an athlete belongs to (may be several, or none). */
export function groupsForAthlete(groups: Group[], athleteId: string): Group[] {
  return groups.filter(g => g.athleteIds.includes(athleteId));
}

/** Athletes that belong to no group at all. */
export function ungroupedAthletes(persons: Person[], groups: Group[]): AthleteView[] {
  const claimed = new Set(groups.flatMap(g => g.athleteIds));
  return athleteViews(persons).filter(a => !claimed.has(a.id));
}

// ===== Emergency contacts / guardians (edges in contactLinks) =====

/** A contact for an athlete, resolved to the contact Person + the per-edge guardian flag. */
export interface ContactView {
  link: ContactLink;
  person: Person;
  guardian: boolean;
}

/** All emergency contacts linked to an athlete (resolved + guardian flag from the edge). */
export function contactsForAthlete(persons: Person[], links: ContactLink[], athleteId: string): ContactView[] {
  const byId = new Map(persons.map(p => [p.id, p]));
  return links
    .filter(l => l.athleteId === athleteId)
    .map(l => ({ link: l, person: byId.get(l.contactId), guardian: l.guardian }))
    .filter((c): c is ContactView => c.person !== undefined);
}

/** The subset of an athlete's contacts that are guardians. */
export function guardiansForAthlete(persons: Person[], links: ContactLink[], athleteId: string): ContactView[] {
  return contactsForAthlete(persons, links, athleteId).filter(c => c.guardian);
}

/** Athletes a given contact is linked to. */
export function athletesForContact(persons: Person[], links: ContactLink[], contactId: string): Person[] {
  const byId = new Map(persons.map(p => [p.id, p]));
  return links
    .filter(l => l.contactId === contactId)
    .map(l => byId.get(l.athleteId))
    .filter((p): p is Person => p !== undefined);
}
