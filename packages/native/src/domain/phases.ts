import { GameDefinition, SessionPhase } from '../types';

/**
 * Phase helpers. The 5 protocol phases are a fixed ordered sequence (1 → 5). A game may be
 * eligible for several phases (sessionPhases); when placed in a plan it is grouped under its
 * lowest eligible phase ("primary"). Pure + UI-free.
 */

export const PHASES: SessionPhase[] = [1, 2, 3, 4, 5];

/** Lowest eligible phase of a game — the section a plan groups it under. Defaults to 3 (Main). */
export function primaryPhase(game: GameDefinition | undefined): SessionPhase {
  const phs = game?.sessionPhases;
  return (phs && phs.length ? (Math.min(...phs) as SessionPhase) : 3);
}

/** Is the game eligible for this phase? */
export function gameInPhase(game: GameDefinition, phase: SessionPhase): boolean {
  return game.sessionPhases.includes(phase);
}

/** Coarse colour band derived from the phase number (1–2 warm-up, 3 main, 4–5 cool-down). */
export function phaseBand(phase: SessionPhase): 'warmup' | 'main' | 'cooldown' {
  return phase <= 2 ? 'warmup' : phase === 3 ? 'main' : 'cooldown';
}
