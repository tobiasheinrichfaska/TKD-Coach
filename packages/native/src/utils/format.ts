import { Belt } from '../types';
import { getBeltLabel } from '../constants/belts';

/**
 * Format ISO date string to readable German date (e.g., "30.05.2026").
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format seconds to readable duration (e.g., "1m 23s" or "45s").
 */
export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || seconds === null) return '0s';
  const secs = Math.round(seconds);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return remainder > 0 ? `${mins}m ${remainder}s` : `${mins}m`;
}

/**
 * Format belt type to readable German label.
 */
export function formatBelt(belt: Belt): string {
  return getBeltLabel(belt);
}

/**
 * Format a date for session planning (e.g., "Tomorrow" or "30.05").
 */
export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  const today = new Date();

  // Check if today
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Heute';
  }

  // Check if tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  ) {
    return 'Morgen';
  }

  // Default: day.month
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

/**
 * Format ISO timestamp to German time (e.g., "14:30 Uhr").
 */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} Uhr`;
}

/**
 * Calculate delta indicator text (e.g., "+5s" or "-2s").
 */
export function formatDelta(current: number, previous: number | undefined): string {
  if (previous === undefined) return '—';
  const delta = current - previous;
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '=';
}

/**
 * Generate a Signal-friendly session summary text.
 */
export function generateSessionSummaryText(
  groupName: string,
  date: string,
  games: Array<{ name: string; plannedMinutes: number; actualSeconds?: number }>
): string {
  const gameLines = games
    .map(g => {
      const actual = g.actualSeconds ? `→ ${formatDuration(g.actualSeconds)}` : '';
      return `• ${g.name}: ${g.plannedMinutes}min ${actual}`;
    })
    .join('\n');

  return `Session abgeschlossen\n${groupName} · ${formatDate(date)}\n\n${gameLines}`;
}

/**
 * Generate a Signal-friendly athlete progress summary text.
 */
export function generateProgressSummaryText(
  athleteName: string,
  belt: Belt,
  metrics: Array<{ metricName: string; current: number; previous?: number; unit: string }>
): string {
  const lines = metrics
    .map(m => {
      const delta = formatDelta(m.current, m.previous);
      return `${m.metricName}: ${m.current}${m.unit} ${delta}`;
    })
    .join('\n');

  return `Fortschritt: ${athleteName}\n${formatBelt(belt)}\n\n${lines}`;
}
