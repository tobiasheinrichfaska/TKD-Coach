import { AppData } from '../types';
import { BUILTIN_GAMES } from '../constants/games';
import { BUILTIN_TEMPLATES } from './templates';

/**
 * Bring stored data up to the current shape:
 * - refresh built-in Übungen from the canonical seed (new Übungen + new fields
 *   like sessionPhase/techniques/bodyParts), preserving user-created games;
 * - refresh built-in session templates the same way, preserving user templates;
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
  return {
    ...data,
    games: [...BUILTIN_GAMES, ...userGames],
    sessionTemplates: [...BUILTIN_TEMPLATES, ...userTemplates],
  };
}
