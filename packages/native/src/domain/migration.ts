import { AppData } from '../types';
import { BUILTIN_GAMES } from '../constants/games';
import { LEGACY_BELT_MAP } from '../constants/belts';
import { BUILTIN_TEMPLATES } from './templates';

/**
 * Bring stored data up to the current shape:
 * - refresh built-in Übungen from the canonical seed (new Übungen + new fields
 *   like sessionPhase/techniques/bodyParts), preserving user-created games;
 * - refresh built-in session templates the same way, preserving user templates;
 * - normalise legacy colour-belt ids to the new Kup/Dan ladder ids;
 * - backfill collections missing on older saves.
 * Pure — used by DataContext on load (and as the fresh-install seed) and unit-tested here.
 */
export function migrate(data: AppData): AppData {
  const userGames = (data.games || []).filter(
    g => !g.isBuiltIn && !BUILTIN_GAMES.some(b => b.id === g.id)
  );
  const userTemplates = (data.sessionTemplates || []).filter(
    t => !t.isBuiltIn && !BUILTIN_TEMPLATES.some(b => b.id === t.id)
  );
  const athletes = (data.athletes || []).map(a =>
    LEGACY_BELT_MAP[a.belt] ? { ...a, belt: LEGACY_BELT_MAP[a.belt] } : a
  );
  return {
    ...data,
    athletes,
    games: [...BUILTIN_GAMES, ...userGames],
    sessionTemplates: [...BUILTIN_TEMPLATES, ...userTemplates],
  };
}
