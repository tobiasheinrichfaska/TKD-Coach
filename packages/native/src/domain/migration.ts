import { AppData } from '../types';
import { BUILTIN_GAMES } from '../constants/games';

/**
 * Refresh built-in Übungen from the canonical seed so existing installs gain new
 * Übungen + new fields (sessionPhase/techniques/bodyParts), while preserving any
 * user-created games. Pure — used by DataContext on load and unit-tested here.
 */
export function migrate(data: AppData): AppData {
  const userGames = (data.games || []).filter(
    g => !g.isBuiltIn && !BUILTIN_GAMES.some(b => b.id === g.id)
  );
  return { ...data, games: [...BUILTIN_GAMES, ...userGames] };
}
